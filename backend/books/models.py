from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Author(models.Model):
    name = models.CharField(max_length=70, unique=True)

class Book(models.Model):
    # Intrinsic, Acquired from external databse, not editable
    title = models.CharField(max_length=200)
    authors = models.ManyToManyField(Author)
    isbn_13 = models.CharField(max_length=13, unique=True)
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
    pageCount = models.PositiveIntegerField(default=None, null=True, blank=True) 
    width = models.FloatField(default=None, null=True, blank=True) 
    height = models.FloatField(default=None, null=True, blank=True) 
    thickness = models.FloatField(default=None, null=True, blank=True)

    # Extrinsic, Must be positive, required.
    retail_price = models.FloatField() 

    # Extrinsic, required
    genres = models.ManyToManyField('genres.Genre') 

    # Ghost Column to check if Book is Deleted but Still Can Reference
    isGhost = models.BooleanField(default=False)

    # Number of books left in stock
    stock = models.PositiveIntegerField(default=0)

class BookImage(models.Model):
    book = models.OneToOneField(Book, related_name='image_url', on_delete=models.CASCADE, primary_key=True)
    image_url = models.URLField()

    def __str__(self):
        return self.image_url