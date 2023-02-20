from .csv_column_headers import get_csv_headers, csv_column_headers
import pandas as pd
from .csv_exceptions import MissingHeadersException, ExtraHeadersException, InvalidISBN13LengthException, NotInDbException, InsufficientStockException, NotAnIntegerException, NegativeValueException, NotANumberException, EmptyValueException, DuplicateValidHeadersException
from typing import Callable
from books.models import Book


class CSVFormatChecker:

    def __init__(self, csv_import_type: str) -> None:
        self.expected_headers = get_csv_headers(csv_import_type)
        self.price = csv_column_headers.get(csv_import_type)[0]

    def are_headers_correct(self, csv_file) -> None:
        csv_headers = []
        for line in csv_file:
            csv_headers = [header.strip() for header in line.decode().split(',')]
            break
        actual_headers = [header.lower() for header in csv_headers]
        missing_headers = [header for header in self.expected_headers if header not in actual_headers]
        if len(missing_headers) != 0:
            raise MissingHeadersException(missing_headers)
        self.is_duplicate_valid_headers(actual_headers)
        extra_headers = [header for header in actual_headers if header not in self.expected_headers]
        if len(extra_headers) != 0:
            raise ExtraHeadersException(extra_headers)

    def is_duplicate_valid_headers(self, actual_headers: list):
        valid_headers = [header for header in actual_headers if header in self.expected_headers]
        if len(valid_headers) > len(self.expected_headers):
            raise DuplicateValidHeadersException()

    def find_malformed_data(self, csv_df: pd.DataFrame) -> list:
        """Returns for each row the columns with malformed data"""
        csv_df = csv_df.rename(columns={"isbn_13": "isbn13"})
        malformed_cells = [{} for _ in range(len(csv_df.index))]

        for index, row in csv_df.iterrows():
            for column in csv_df.columns:
                try:
                    # This is using reflection to call the condition checking method that corresponds to the column. name_of_method_to_call = the last word in the column name (i.e. word that comes after the last underscore) + "_conditions". This is done so that the type of price can be different between purchases, sales, and buybacks, but they are all still are checked the same using "price_condtions".
                    name_of_method_to_call = f"{column.rsplit('_', 1)[-1]}_conditions"
                    getattr(self, name_of_method_to_call)(row)
                except Exception as e:
                    malformed_cells[index][column] = str(e)
        return malformed_cells

    def apply_condition(self, header: str, df: pd.DataFrame, func: Callable) -> None:
        df[header] = df[header].apply(func)

    def isbn13_conditions(self, row):
        isbn_13 = row["isbn13"]
        self.is_empty(isbn_13)
        self.is_number(isbn_13)
        self.is_int(isbn_13)
        self.is_int_negative(isbn_13)
        self.is_length_13(isbn_13)
        self.book_exists_in_db(isbn_13)

    def quantity_conditions(self, row) -> bool:
        quantity = row["quantity"]
        isbn_13 = row["isbn13"]
        self.is_empty(quantity)
        self.is_number(quantity)
        self.is_int(quantity)
        self.is_int_negative(quantity)
        if "unit_wholesale_price" not in row.index:
            self.check_for_sufficient_inventory(quantity, isbn_13)

    def check_for_sufficient_inventory(self, quantity, isbn_13):
        try:
            book_stock = Book.objects.filter(isbn_13=isbn_13).get().stock
        except Book.DoesNotExist:  # if the book does not exist, can't do a quantity check, so just return
            return
        if int(quantity) > book_stock:
            raise InsufficientStockException(book_stock)

    def price_conditions(self, row) -> bool:
        price = row[self.expected_headers[0]]
        self.is_empty(price)
        self.is_number(price)
        self.is_float_negative(price)

    def book_exists_in_db(self, isbn_13: str) -> bool:
        book = Book.objects.filter(isbn_13=isbn_13)
        if len(book) == 0 or book.get().isGhost:
            raise NotInDbException()

    def is_number(self, value: str):
        try:
            float(value)
        except ValueError:
            raise NotANumberException()

    def is_int(self, value: str):
        try:
            int(value)
        except:
            raise NotAnIntegerException()

    def is_int_negative(self, value: str):
        if int(value) < 0:
            raise NegativeValueException()

    def is_float_negative(self, value: str):
        if float(value) < 0:
            raise NegativeValueException()

    def is_empty(self, value: str):
        if len(value) == 0:
            raise EmptyValueException()

    def is_length_13(self, value: str):
        if len(value) != 13:
            raise InvalidISBN13LengthException()