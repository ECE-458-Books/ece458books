from rest_framework import serializers
from authapp.models import User
from books.models import Book

from .models import Bookcase, Shelf, DisplayedBook

class DisplayedBookSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    #book_isbn: serializers.SerializerMethodField()
    #book_title: serializers.SerializerMethodField()

    def get_book_isbn(self, instance):
        return instance.book.isbn_13

    def get_book_title(self, instance):
        return instance.book.title

    class Meta:
        model = DisplayedBook
        fields = ['id', 'book',
                   'display_mode', 'display_count']

class ShelfSerializer(serializers.ModelSerializer):
    books = DisplayedBookSerializer(many=True)

    class Meta:
        model = Shelf
        fields = ['id', 'books']

    def create(self, data):
        books = data.pop('books')
        data.pop('books')
        shelf = Shelf.objects.create(**data)
        for idx, book in enumerate(books):
            DisplayedBook.objects.create(shelf=shelf, ordering=idx, **book)
        return shelf

class BookcaseSerializer(serializers.ModelSerializer):
    # To be completed when users are implemented
    #creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    #last_editor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    shelves = ShelfSerializer(many=True)

    class Meta:
        model = Bookcase
        fields = ['id', 'name', 
                  'last_edit_date', 'width', 'shelves'
                  # To be completed when users are implemented
                  #'creator', 'last_editor', 
                  ]
        
    def create(self, data):
        shelves = data.pop('shelves')
        bookcase = Bookcase.objects.create(**data)
        for idx, shelf in enumerate(shelves):
            Shelf.objects.create(bookcase=bookcase, ordering=idx, **shelf)
        return bookcase