import csv

from django.http import HttpResponse

from rest_framework.request import Request
from rest_framework.response import Response

from books.models import Book
from books.search_filters import generate_filter_from_query_params
from .csv_export_formatter import CSVExportFormatter


class CSVWriter:
    def __init__(self, csv_export_type: str) -> None:
        self.csv_export_type = csv_export_type
        self.csv_export_formatter = CSVExportFormatter(csv_export_type)
    
    def write_csv(self, request: Request):
        default = Response(f"Invalid CSV export type: {self.csv_export_type}")
        return getattr(self, 'write_csv_' + self.csv_export_type, lambda: default)(request)
    
    def write_csv_books(self, request: Request):
        # Turn request.query_params to filter
        filter_kwargs = generate_filter_from_query_params(request.query_params.dict())
        books = Book.objects.filter(**filter_kwargs)

        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="books.csv"'}
        )

        writer = csv.writer(response)
        writer.writerow(self.csv_export_formatter.get_export_headers())
        for book in books:
            row = self.csv_export_formatter.format_book(book)
            writer.writerow(row)

        return response
