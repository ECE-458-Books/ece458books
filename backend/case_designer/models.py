from django.db import models

DISPLAY_MODE_CHOICES = [
    ('SO', 'Spine Out')
    ('CO', 'Cover Out')
]

class Bookcase(models.Model):
    name=models.CharField(max_length=50)
    creator=models.ForeignKey('auth.User')
    last_editor=models.ForeignKey('auth.User')
    last_edit_date=models.DateTimeField()
    width=models.FloatField()

class Shelf(models.Model):
    bookcase=models.ForeignKey(Bookcase)

class DisplayedBook(models.Model):
    book=models.ForeignKey('books.Book')
    shelf=models.ForeignKey(Shelf)
    display_mode=models.CharField(max_length=50, choices=DISPLAY_MODE_CHOICES)
    display_count=models.PositiveIntegerField()