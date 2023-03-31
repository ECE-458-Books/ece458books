import io
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Image
import requests

from .models import Bookcase

class PlanogramGenerator:
    def __init__(self, bookcase: Bookcase) -> None:
        self.bookcase = bookcase

    def generate_planogram(self):
        response = HttpResponse(
            content_type='application/pdf',
            headers={'Content-Disposition': 'attachment; filename="planogram.pdf"'}
        )
        doc = SimpleDocTemplate(response)
        doc.build(self.create_document_elements()) 
        return response

    def create_document_elements(self):
        elements = []
        elements.append(self.create_books_table())
        elements.append(self.create_layout_table())
        return elements

    def create_books_table(self):
        data = [("Image", "Title", "Author", "ISBN13", "Display Count")]
        data = self.create_display_books_data()
        table = Table(data, colWidths=[50, 250, 100, 100, 50])
        return table  

    def create_display_books_data(self):
        display_books_dict = {}
        shelves = self.bookcase.shelves.all()
        for shelf in shelves:
            for display_book in shelf.displayed_books.all():
                if display_book.book in display_books_dict:
                    display_books_dict[display_book.book][3] += display_book.display_count
                else:
                    display_books_dict[display_book.book] = self.create_display_book_row(display_book)
                    
        return [*display_books_dict.values()]

    def create_display_book_row(self, display_book):
        authors = ""
        for author in display_book.book.authors.all():
            authors += author.name + ", "
        resp = requests.get(display_book.book.image_url)
        img = Image(io.BytesIO(resp.content))
        img._restrictSize(30, 30)
        return [img, Paragraph(display_book.book.title), authors, display_book.book.isbn_13, display_book.display_count]

    def create_layout_table(self):
        data=[(1,2),(3,4)]
        table = Table(data, colWidths=270, rowHeights=79)
        return table 