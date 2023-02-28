from books.models import Book

from .book_switch import BookSwitch

csv_switch = {
    "books": BookSwitch
}

def get_csv_switch(csv_export_type: str):
    return csv_switch.get(csv_export_type, None)
    