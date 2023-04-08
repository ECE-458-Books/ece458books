from django.db import models
from books.models import Book
from django.core.validators import MinValueValidator


class SalesReconciliation(models.Model):
    date = models.DateField()
    is_sales_record = models.BooleanField()


class Sale(models.Model):
    book = models.ForeignKey(Book, related_name='books', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_retail_price = models.FloatField(validators=[MinValueValidator(0)])
    sales_reconciliation = models.ForeignKey(SalesReconciliation, related_name='sales', on_delete=models.CASCADE)
    revenue = models.FloatField()

    def save(self, *args, **kwargs):
        self.revenue = float(f'{self.quantity*self.unit_retail_price:.2f}')
        self.unit_retail_price = float(f'{self.unit_retail_price:.2f}')
        super(Sale, self).save(*args, **kwargs)
