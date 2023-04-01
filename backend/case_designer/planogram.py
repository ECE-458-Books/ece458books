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
    default_spacer = Spacer(300, 20)

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
        elements.extend(self.create_bookcase_info())
        elements.extend(self.create_display_books_table_and_header())
        elements.extend(self.create_bookcase_layout_tables_and_headers())
        return elements
    
    # Bookcase information table
    def create_bookcase_info(self):
        data = [("Name = " + self.bookcase.name, "Width (in) = " + str(self.bookcase.width))]
        table = Table(data, colWidths=[200, 200])
        return [table, self.default_spacer]

    # Display books table, summarizing totals of each book along with some facts about the book and the book image
    def create_display_books_table_and_header(self):
        data = [("Image", "Title", "Author(s)", "ISBN13", Paragraph("Total Display Count"))]
        data.extend(self.create_display_books_data())
        table = Table(data, colWidths=[50, 250, 100, 100, 50], style=self.table_style)
        return [Paragraph("Displayed Books Informationa and Total Count"), self.default_spacer, table, self.default_spacer]

    def create_display_books_data(self):
        display_books_dict = {}
        for shelf in self.shelves:
            for display_book in shelf.displayed_books.all():
                #If book exists, update the display count. Otherwise, create a new row
                if display_book.book in display_books_dict:
                    display_books_dict[display_book.book][4] += display_book.display_count
                else:
                    display_books_dict[display_book.book] = self.create_display_book_row(display_book)
                    
        return [*display_books_dict.values()]

    def create_display_book_row(self, display_book):
        authors = ", ".join(list(display_book.book.authors.all().values_list('name', flat=True)))
        img = self.get_display_book_image(display_book)
        return [img, Paragraph(display_book.book.title), Paragraph(authors), display_book.book.isbn_13, display_book.display_count]

    # Layout table, showing information about the books and the order they should be displayed in
    # (similar to the case designer page)
    def create_bookcase_layout_tables_and_headers(self):
        tables = []
        for idx, shelf in enumerate(self.shelves):
            tables.extend(self.create_shelf_layout_table_and_headers(shelf, idx+1))
        return tables
    
    def create_shelf_layout_table_and_headers(self, shelf, shelf_num):
        rows = [("Image", "Title", "Display Count", "Display Mode")]
        for display_book in shelf.displayed_books.all():
            rows.append(self.create_layout_book(display_book))
        table = Table(rows, colWidths=[50, 300, 100, 100], style=self.table_style)
        return [Paragraph(f"Shelf {shelf_num}"), self.default_spacer, table, self.default_spacer]
    
    def create_layout_book(self, display_book):
        img = self.get_display_book_image(display_book)
        return (img, Paragraph(display_book.book.title), display_book.display_count, display_book.display_mode)
        
    def get_display_book_image(self, display_book):
        resp = requests.get(display_book.book.image_url)
        img = Image(io.BytesIO(resp.content))
        img._restrictSize(30, 30)
        return img
