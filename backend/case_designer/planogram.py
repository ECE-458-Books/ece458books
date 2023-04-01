import io
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Image, Spacer
import requests

from .models import Bookcase

class PlanogramGenerator:
    # Style used for all tables, it creates grid lines and centers the elements
    table_style = [
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN',(0,0),(-1,-1),'CENTER'),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]

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
        elements.extend(self.create_shelf_layout_tables())
        return elements
    
    # Display books table, summarizing totals of each book along with some facts about the book and the book image
    def create_display_books_table(self):
        data = [("Image", "Title", "Author", "ISBN13", Paragraph("Display Count"))]
        data.extend(self.create_display_books_data())
        table = Table(data, colWidths=[50, 250, 100, 100, 50], style=self.table_style)
        return table  

    def create_display_books_data(self):
        display_books_dict = {}
        for shelf in self.shelves:
            for display_book in shelf.displayed_books.all():
                if display_book.book in display_books_dict:
                    display_books_dict[display_book.book][4] += display_book.display_count
                else:
                    display_books_dict[display_book.book] = self.create_display_book_row(display_book)
                    
        return [*display_books_dict.values()]

    def create_display_book_row(self, display_book):
        authors = ""
        for author in display_book.book.authors.all():
            authors += author.name + ", "
        img = self.get_display_book_image(display_book)
        return [img, Paragraph(display_book.book.title), Paragraph(authors), display_book.book.isbn_13, display_book.display_count]

    # Layout table, showing information about the books and the order they should be displayed in
    # (similar to the case designer page)
    def create_shelf_layout_tables(self):
        tables = []
        for idx, shelf in enumerate(self.shelves):
            tables.append(Paragraph(f"Shelf {idx + 1}"))
            tables.append(Spacer(300, 20))
            tables.append(self.create_shelf_layout_table(shelf))
            tables.append(Spacer(300, 20))
        return tables
    
    def create_shelf_layout_table(self, shelf):
        rows = [("Image", "Title", "Display Count", "Display Mode")]
        for display_book in shelf.displayed_books.all():
            rows.append(self.create_layout_book(display_book))
        return Table(rows, colWidths=[50, 300, 100, 100], style=self.table_style)
        
    
    def create_layout_book(self, display_book):
        img = self.get_display_book_image(display_book)
        return (img, Paragraph(display_book.book.title), display_book.display_count, display_book.display_mode)
        
    def get_display_book_image(self, display_book):
        resp = requests.get(display_book.book.image_url)
        img = Image(io.BytesIO(resp.content))
        img._restrictSize(30, 30)
        return img
