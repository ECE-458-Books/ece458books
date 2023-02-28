from .csv_column_headers import get_csv_export_headers, csv_column_headers
from .csv_switch import get_csv_switch
from books.models import Book

class CSVExportFormatter:
    def __init__(self, csv_export_type: str) -> None:
        self.headers = get_csv_export_headers(csv_export_type)
        self.switch = get_csv_switch(csv_export_type)()
    
    def format_book(self, book: Book) -> list:
        ret = list()
        for header in self.headers:
            v = self.get_book_attribute(book, header)
            ret.append(v)
        
        return ret
    
    def get_export_headers(self,):
        return self.headers
    
    def get_book_attribute(self, book, header):
        v = self.switch.header(book, header)
        return v