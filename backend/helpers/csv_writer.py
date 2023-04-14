import csv

from django.http import HttpResponse

from rest_framework.request import Request
from rest_framework.response import Response

from books.models import Book
from books.search_filters import generate_filter_from_query_params
from books.serializers import BookListAddSerializer
from books.remote_books import RemoteSubsidiaryTools
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

        # Order queryset by given ordering default is title
        ordering = request.query_params.dict().get('ordering', 'title')
        if ordering == '': ordering = 'title'

        books = books.order_by(ordering)

        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="books.csv"'}
        )

        writer = csv.writer(response)
        writer.writerow(self.csv_export_formatter.get_export_headers())

        remote_dict = self.get_remote_book_data(books)

        for book in books:
            # Serialize each book
            serializer = BookListAddSerializer(book)
            data = self.add_remote_books(remote_dict, serializer.data)
            row = self.csv_export_formatter.format_book(data)
            writer.writerow(row)

        return response
    
    def add_remote_books(self, remote_dict, data):
        if found := remote_dict.get(data['isbn_13'], None):
            data['remote_inventory_count'] = found['inventoryCount']
            data['remote_retail_price'] = found['retailPrice']
        
        return data

    def get_remote_books(self, isbns):
        remote_api_caller = RemoteSubsidiaryTools()
        response = remote_api_caller.get_remote_book_data(isbns)
        return response

    def queryset_to_isbns(self, queryset):
        return [book.isbn_13 for book in queryset]

    def get_remote_book_data(self, queryset):
        isbns = self.queryset_to_isbns(queryset)
        remote_data = self.get_remote_books(isbns)
        return remote_data
