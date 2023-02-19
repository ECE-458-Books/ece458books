from .csv_column_headers import get_csv_headers, csv_column_headers
import pandas as pd
from .csv_exceptions import MissingHeadersException, ExtraHeadersException, InvalidISBN13LengthException, NotInDbException, InsufficientStockException, NotAnIntegerException, NegativeValueException, NotANumberException
from typing import Callable
from books.models import Book


class CSVFormatChecker:

    def __init__(self, csv_import_type: str) -> None:
        self.expected_headers = get_csv_headers(csv_import_type)
        self.price = csv_column_headers.get(csv_import_type)[0]

    def are_headers_correct(self, actual_headers: list) -> None:
        actual_headers = [header.strip().lower() for header in actual_headers]
        missing_headers = [header for header in self.expected_headers if header not in actual_headers]
        if len(missing_headers) != 0:
            raise MissingHeadersException(missing_headers)
        extra_headers = [header for header in actual_headers if header not in self.expected_headers]
        if len(extra_headers) != 0:
            raise ExtraHeadersException(extra_headers)

    def find_malformed_data(self, csv_df: pd.DataFrame) -> list:
        """Returns for each row the columns with malformed data"""
        csv_df = csv_df.rename(columns={"isbn_13": "isbn13"})
        malformed_cells = [{} for _ in range(len(csv_df.index))]

        for index, row in csv_df.iterrows():
            for column in csv_df.columns:
                try:
                    getattr(self, f"{column.rsplit('_', 1)[-1]}_conditions")(row)
                except Exception as e:
                    malformed_cells[index][column] = str(e)
        return malformed_cells

    def apply_condition(self, header: str, df: pd.DataFrame, func: Callable) -> None:
        df[header] = df[header].apply(func)

    def isbn13_conditions(self, row):
        isbn_13 = row["isbn13"]
        if not isbn_13:
            raise NotANumberException()
        if len(isbn_13) != 13:
            raise InvalidISBN13LengthException()
        if not self.book_exists_in_db(isbn_13):
            raise NotInDbException()

    def quantity_conditions(self, row) -> bool:
        quantity = row["quantity"]
        isbn_13 = row["isbn13"]
        if not quantity:
            raise NotANumberException()
        try:
            quantity = int(quantity)
        except ValueError:
            raise NotAnIntegerException()

        if quantity < 0:
            raise NegativeValueException()

        if "unit_wholesale_price" not in row.index:
            self.check_for_sufficient_inventory(quantity, isbn_13)

    def check_for_sufficient_inventory(self, quantity, isbn_13):
        try:
            book_stock = Book.objects.filter(isbn_13=isbn_13).get().stock
        except Book.DoesNotExist:  # if the book does not exist, can't do a quantity check, so just return
            return
        if quantity > book_stock:
            raise InsufficientStockException(book_stock)

    def price_conditions(self, row) -> bool:
        price = row[self.expected_headers[0]]
        try:
            price = float(price)
        except ValueError:
            raise NotANumberException()

        if price < 0:
            raise NegativeValueException()

    def book_exists_in_db(self, isbn_13: str) -> bool:
        return len(Book.objects.filter(isbn_13=isbn_13)) > 0
