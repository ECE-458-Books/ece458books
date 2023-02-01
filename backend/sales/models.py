from django.db import models
from books.models import Book
from django.core.validators import MinValueValidator


class SalesReconciliation(models.Model):
    date = models.DateField()


class Sale(models.Model):
    book = models.ForeignKey(Book, related_name='books', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_retail_price = models.FloatField(validators=[MinValueValidator(0)])
    sales_reconciliation = models.ForeignKey(SalesReconciliation, related_name='sales', on_delete=models.CASCADE)
