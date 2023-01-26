from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Genre(models.Model):
    name = models.CharField(max_length=30)

class Author(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=40)

class Book(models.Model):
    # Intrinsic, Acquired from external databse, not editable
    title = models.CharField(max_length=200)
    authors = models.ManyToManyField(Author)
    isbn_13 = models.IntegerField(
        unique = True,
        validators=[
            MaxValueValidator(9999999999999),
            MinValueValidator(1000000000000)
        ]
    )
    isbn_10 = models.IntegerField(
        validators=[
            MaxValueValidator(9999999999),
            MinValueValidator(1000000000)
        ]
    )
    publisher = models.CharField(max_length=50)
    publication_year = models.IntegerField(
        validators=[
            MaxValueValidator(3000),
            MinValueValidator(0)
        ]
    )

    # Intrinsic and acquired from external database if available.
    # May be overriden or provided if absent from external database, or left unspecified
    page_cnt = models.PositiveIntegerField() 
    width = models.FloatField() 
    height = models.FloatField() 
    thickness = models.FloatField()

    # Extrinsic, Must be positive, required.
    retail_price = models.FloatField() 

    # Extrinsic, required
    genre = models.ManyToManyField(Genre) 
