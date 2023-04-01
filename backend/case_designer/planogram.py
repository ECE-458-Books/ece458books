import io
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Image, KeepTogether, Frame
import requests

from .models import Bookcase

class PlanogramGenerator:
    def __init__(self, bookcase: Bookcase) -> None:
        self.bookcase = bookcase
        self.shelves = bookcase.shelves.all()

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
        elements.append(self.create_display_books_table())
        elements.append(self.create_layout_table())
        return elements
    
    # Display books table, summarizing totals of each book along with some facts about the book and the book image
    def create_display_books_table(self):
        data = [("Image", "Title", "Author", "ISBN13", "Display Count")]
        data = self.create_display_books_data()
        table = Table(data, colWidths=[50, 250, 100, 100, 50])
        return table  

    def create_display_books_data(self):
        display_books_dict = {}
        for shelf in self.shelves:
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
        img = self.get_display_book_image(display_book)
        return [img, Paragraph(display_book.book.title), authors, display_book.book.isbn_13, display_book.display_count]

    # Layout table, showing information about the books and the order they should be displayed in
    # (similar to the case designer page)
    def create_layout_table(self):
        data = self.create_layout_data()
        table = Table(data, colWidths=[300])
        return table 
    
    def create_layout_data(self):
        data = []
        for shelf in self.shelves:
            data.append(self.create_layout_shelf(shelf))
        return data
    
    def create_layout_shelf(self, shelf):
        row = []
        for display_book in shelf.displayed_books.all():
            row.append(self.create_layout_book(display_book))
        frame = Frame()
        return row
    
    def create_layout_book(self, display_book):
        
        img = self.get_display_book_image(display_book)
        val = [img, Paragraph(display_book.book.title)]
        return
        
    def get_display_book_image(self, display_book):
        resp = requests.get(display_book.book.image_url)
        img = Image(io.BytesIO(resp.content))
        img._restrictSize(30, 30)
        return img
