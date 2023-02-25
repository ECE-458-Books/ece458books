from django.db import models
from vendors.models import Vendor
from books.models import Book
from django.core.validators import MinValueValidator


class BuybackOrder(models.Model):
    date = models.DateField()
    vendor = models.ForeignKey(Vendor, related_name='bb_vendors', on_delete=models.CASCADE)


class Buyback(models.Model):
    book = models.ForeignKey(Book, related_name='bb_books', on_delete=models.CASCADE)
    quantity = models.PositiveBigIntegerField()
    unit_buyback_price = models.FloatField(validators=[MinValueValidator(0)])
    buyback_order = models.ForeignKey(BuybackOrder, related_name='buybacks', on_delete=models.CASCADE)
    revenue = models.FloatField()

    def save(self, *args, **kwargs):
        self.revenue = round(self.quantity * self.unit_buyback_price, 2)
        self.unit_buyback_price = round(self.unit_buyback_price, 2)
        super(Buyback, self).save(*args, **kwargs)
