from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Vendor(models.Model):
    name = models.CharField(max_length=40, unique=True)
    buyback_rate = models.PositiveIntegerField(
        default=None,
        validators=[
            MaxValueValidator(100),
            MinValueValidator(0)
        ], null=True, blank=True)