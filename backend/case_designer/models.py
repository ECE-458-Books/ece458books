from django.db import models

from books.models import Book

DISPLAY_MODE_CHOICES = [
    ('Spine Out', 'Spine Out'),
    ('Cover Out', 'Cover Out')
]

class Bookcase(models.Model):
    name=models.CharField(max_length=50)
    # To be completed when users are implemented
    #creator=models.ForeignKey('auth.User', on_delete=models.CASCADE)
    #last_editor=models.ForeignKey('auth.User', on_delete=models.CASCADE)
    last_edit_date=models.DateTimeField(auto_now=True)
    width=models.FloatField()

class Shelf(models.Model):
    bookcase=models.ForeignKey(Bookcase, related_name="shelves", on_delete=models.CASCADE)
    ordering=models.PositiveIntegerField()

class DisplayedBook(models.Model):
    book=models.ForeignKey(Book, related_name="displayed_books", on_delete=models.CASCADE)
    shelf=models.ForeignKey(Shelf, on_delete=models.CASCADE)
    display_mode=models.CharField(max_length=50, choices=DISPLAY_MODE_CHOICES)
    display_count=models.PositiveIntegerField()
    ordering=models.PositiveIntegerField()