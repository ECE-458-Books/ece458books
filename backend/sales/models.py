from django.db import models

from books.models import Book
from django.core.validators import MinValueValidator


class Sale(models.Model):
    book = models.ForeignKey(Book, models.CASCADE, to_field='isbn_13')
    quantity = models.PositiveIntegerField()
    unit_retail_price = models.FloatField(validators=[MinValueValidator(0)])


class SalesReconciliation(models.Model):
    date = models.DateField()
    sales = models.ForeignKey(Sale, models.CASCADE)