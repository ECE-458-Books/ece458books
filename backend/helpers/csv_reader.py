from rest_framework.response import Response
from rest_framework import status
from books.models import Book
from helpers.csv_format_checker import CSVFormatChecker
from rest_framework.request import Request
from helpers.csv_exceptions import ExtraHeadersException, MissingHeadersException
import pandas as pd


class CSVReader:

    def __init__(self, csv_import_type: str) -> None:
        self.csv_import_type = csv_import_type

    def read_csv(self, request: Request):
        response_data = {}
        csv_format_checker = CSVFormatChecker(self.csv_import_type)
        csv = request.FILES["file"]
        try:
            csv_df = pd.read_csv(csv, dtype=str, keep_default_na=False)
        except pd.errors.EmptyDataError:
            return Response({"errors": "empty_csv"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            csv_format_checker.are_headers_correct(csv_df.columns.to_list())
        except MissingHeadersException as mse:
            return Response({"errors": mse.missing_headers}, status=status.HTTP_400_BAD_REQUEST)
        except ExtraHeadersException as ehe:
            response_data["errors"] = ehe.extra_headers
            csv_df.drop(ehe.extra_headers.split(" "), axis=1, inplace=True)

        malformed_data = csv_format_checker.find_malformed_data(csv_df)

        response_data = {self.csv_import_type: [{"errors": data} for data in malformed_data]}
        for index, row in csv_df.iterrows():
            if "isbn13" not in malformed_data[index].keys():  # There is an issue with the isbn, so can't get book data
                book = Book.objects.filter(isbn_13=row["isbn_13"]).get()
                response_data[self.csv_import_type][index]["book"] = book.id
                response_data[self.csv_import_type][index]["book_title"] = book.title
                response_data[self.csv_import_type][index]["isbn_13"] = row["isbn_13"]
            response_data[self.csv_import_type][index]["quantity"] = row["quantity"]
            price_type = csv_format_checker.price
            response_data[self.csv_import_type][index][price_type] = row[price_type]

        return Response(response_data, status=status.HTTP_200_OK)
