from django.db import models
from vendors.models import Vendor
from books.models import Book
from django.core.validators import MinValueValidator

class PurchaseOrder(models.Model):
    date = models.DateField()
    vendor = models.ForeignKey(Vendor, related_name='vendors', on_delete=models.CASCADE)

class Purchase(models.Model):
    book = models.ForeignKey(Book, related_name='po_books', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_wholesale_price = models.FloatField(validators=[MinValueValidator(0)])
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='purchases', on_delete=models.CASCADE)
    cost = models.FloatField()

    def save(self, *args, **kwargs):
        self.cost = float(f'{self.quantity * self.unit_wholesale_price:.2f}')
        self.unit_wholesale_price = float(f'{self.unit_wholesale_price:.2f}')
        super(Purchase, self).save(*args, **kwargs)
