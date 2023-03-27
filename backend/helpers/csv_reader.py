from rest_framework.response import Response
from rest_framework import status
from books.models import Book
from books.isbn import ISBNTools
from helpers.csv_format_checker import CSVFormatChecker
from rest_framework.request import Request
from helpers.csv_exceptions import ExtraHeadersException, MissingHeadersException, DuplicateValidHeadersException
import pandas as pd
from purchase_orders.models import Purchase
from django.db.models import Q
from vendors.models import Vendor


class CSVReader:

    def __init__(self, csv_import_type: str) -> None:
        self.csv_import_type = csv_import_type

    def read_csv(self, request: Request):
        response_data = {}
        csv_format_checker = CSVFormatChecker(self.csv_import_type)
        csv = request.FILES["file"]

        try:
            csv_df = pd.read_csv(csv, dtype=str, keep_default_na=False, index_col=False, encoding='utf-8-sig')
            csv_df = csv_df.apply(lambda x: x.str.strip()).rename(columns=lambda x: x.strip())
            csv_df[csv_format_checker.price] = csv_df[csv_format_checker.price].map(lambda x: x.replace("$", ""))
            isbn_tools = ISBNTools()
            csv_df.loc[:, 'isbn'] = csv_df.loc[:, 'isbn'].apply(lambda x: isbn_tools.parse_isbn(x) if isbn_tools.is_valid_isbn(x) else x)
        except pd.errors.EmptyDataError:
            return Response({"errors": ["empty_csv"]}, status=status.HTTP_400_BAD_REQUEST)
        except pd.errors.ParserError as e:
            parse_error = str(e)[str(e).find("C error: ") + len("C error: "):].strip()
            return Response({"errors": [parse_error]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            csv_format_checker.are_headers_correct(csv)
        except DuplicateValidHeadersException as dvhe:
            return Response({"errors": str(dvhe)}, status=status.HTTP_400_BAD_REQUEST)
        except MissingHeadersException as mse:
            return Response({"errors": mse.missing_headers}, status=status.HTTP_400_BAD_REQUEST)
        except ExtraHeadersException as ehe:
            response_data["errors"] = ehe.extra_headers
            csv_df.drop(ehe.extra_headers, axis=1, inplace=True)
        malformed_data = csv_format_checker.find_malformed_data(csv_df)
        response_data[self.csv_import_type] = [{"errors": data} for data in malformed_data]
        for index, row in csv_df.iterrows():
            if "isbn" not in malformed_data[index].keys():  # There is an issue with the isbn, so can't get book data
                book = Book.objects.filter(isbn_13=row["isbn"]).get()
                response_data[self.csv_import_type][index]["book"] = book.id
                response_data[self.csv_import_type][index]["book_title"] = book.title
                response_data[self.csv_import_type][index]["isbn_13"] = row["isbn"]
            response_data[self.csv_import_type][index]["quantity"] = row["quantity"]
            price_type = csv_format_checker.price
            response_data[self.csv_import_type][index][price_type] = row[price_type]

        if self.csv_import_type == "buybacks":  # check if vendor has sold the book previously
            for index, buyback in enumerate(response_data['buybacks']):
                errors_dict = buyback['errors']
                if 'isbn' in errors_dict.keys():
                    continue
                isbn = csv_df.iloc[index, csv_df.columns.get_loc("isbn")]
                if len(Purchase.objects.filter(Q(book__isbn_13=isbn) & Q(purchase_order__vendor=request.data['vendor']))) == 0:  # Vendor doesn't sell the book
                    errors_dict['isbn'] = 'book_not_sold_by_vendor'
                else:  # vendor does the sell the book, so if we need to put the default value, we can do so
                    if "unit_price" in errors_dict.keys() and errors_dict["unit_price"] == "empty_value":  # Replace empty value with default
                        vendor_id = request.data['vendor']
                        book_id = buyback["book"]
                        most_recent_purchase = Purchase.objects.filter(purchase_order__vendor=vendor_id).filter(book=book_id).order_by('-purchase_order__date').first()
                        cost_most_recent = most_recent_purchase.unit_wholesale_price
                        vendor_buyback_rate = Vendor.objects.get(id=vendor_id).buyback_rate
                        default_unit_buyback_price = round(cost_most_recent * vendor_buyback_rate * .01, 2)
                        buyback["unit_price"] = default_unit_buyback_price
                        del buyback["errors"]["unit_price"]

        return Response(response_data, status=status.HTTP_200_OK)
