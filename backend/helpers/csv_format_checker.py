from .csv_column_headers import get_csv_headers, csv_column_headers
import pandas as pd
from .csv_exceptions import MissingHeadersException, ExtraHeadersException, NotInDbException, InsufficientStockException, NotAnIntegerException, NegativeValueException, NotANumberException, EmptyValueException, DuplicateValidHeadersException, InvalidISBNException
from typing import Callable
from books.models import Book
from books.isbn import ISBNTools
from django.db.models import Q


class CSVFormatChecker:
    isbn_tools = ISBNTools()

    def __init__(self, csv_import_type: str) -> None:
        self.expected_headers = get_csv_headers(csv_import_type)
        self.price = csv_column_headers.get(csv_import_type)[0]
        self.csv_import_type = csv_import_type

    def are_headers_correct(self, csv_file) -> None:
        csv_headers = []
        for line in csv_file:
            line = line.replace(b'\xef\xbb\xbf', b'')
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

    def isbn_conditions(self, row):
        isbn = row["isbn"]
        self.is_empty(isbn)
        self.is_valid_isbn(isbn)
        self.book_exists_in_db(isbn)

    def quantity_conditions(self, row) -> bool:
        quantity = row["quantity"]
        isbn = row["isbn"]
        self.is_empty(quantity)
        self.is_number(quantity)
        self.is_int(quantity)
        self.is_int_negative(quantity)
        if self.csv_import_type != "purchases":
            self.check_for_sufficient_inventory(quantity, isbn)

    def check_for_sufficient_inventory(self, quantity, isbn):
        try:
            book_stock = Book.objects.filter(isbn_13=isbn).get().stock
        except Book.DoesNotExist:  # if the book does not exist, can't do a quantity check, so just return
            return
        if int(quantity) > book_stock:
            raise InsufficientStockException(book_stock)

    def price_conditions(self, row) -> bool:
        price = row[self.expected_headers[0]]
        self.is_empty(price)
        self.is_number(price)
        self.is_float_negative(price)

    def book_exists_in_db(self, isbn: str) -> bool:
        book = Book.objects.filter(Q(isbn_13=isbn) | Q(isbn_10=isbn))
        if len(book) == 0 or book.get().isGhost:
            raise NotInDbException()

    def is_valid_isbn(self, isbn: str):
        if not self.isbn_tools.is_valid_isbn(isbn):
            raise InvalidISBNException()

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
