from django.db import models

from books.models import Book

DISPLAY_MODE_CHOICES = [
    ('Spine Out', 'Spine Out'),
    ('Cover Out', 'Cover Out')
]

class Bookcase(models.Model):
    name=models.CharField(max_length=50)
    last_edit_date=models.DateTimeField(auto_now=True)
    width=models.FloatField()
    creator=models.ForeignKey('authapp.User', on_delete=models.CASCADE)
    # Will implement when doing update endpoint
    # last_editor=models.ForeignKey('auth.User', on_delete=models.CASCADE)

class Shelf(models.Model):
    bookcase=models.ForeignKey(Bookcase, related_name="shelves", on_delete=models.CASCADE)
    shelf_order=models.PositiveIntegerField()

class DisplayedBook(models.Model):
    shelf=models.ForeignKey(Shelf, related_name="displayed_books", on_delete=models.CASCADE)
    book=models.ForeignKey(Book, on_delete=models.CASCADE)
    display_mode=models.CharField(max_length=50, choices=DISPLAY_MODE_CHOICES)
    display_count=models.PositiveIntegerField()
    display_order=models.PositiveIntegerField()