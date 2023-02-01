from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Genre(models.Model):
    name = models.CharField(max_length=30, unique=True)

class Author(models.Model):
    name = models.CharField(max_length=70, unique=True)

class Book(models.Model):
    # Intrinsic, Acquired from external databse, not editable
    title = models.CharField(max_length=200)
    authors = models.ManyToManyField(Author)
    isbn_13 = models.CharField(max_length=13)
    isbn_10 = models.CharField(max_length=10)
    publisher = models.CharField(max_length=50)
    publishedDate = models.IntegerField(
        validators=[
            MaxValueValidator(3000),
            MinValueValidator(0)
        ]
    )

    # Intrinsic and acquired from external database if available.
    # May be overriden or provided if absent from external database, or left unspecified
    pageCount = models.PositiveIntegerField() 
    width = models.FloatField() 
    height = models.FloatField() 
    thickness = models.FloatField()

    # Extrinsic, Must be positive, required.
    retail_price = models.FloatField() 

    # Extrinsic, required
    genres = models.ManyToManyField(Genre) 
