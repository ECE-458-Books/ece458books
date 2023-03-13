from rest_framework import serializers
from authapp.models import User
from books.models import Book

from .models import Bookcase, Shelf, DisplayedBook

class DisplayedBookSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_isbn = serializers.SerializerMethodField()
    book_title = serializers.SerializerMethodField()
    display_order = serializers.IntegerField(required=False, write_only=True)
    shelf = serializers.PrimaryKeyRelatedField(queryset=Shelf.objects.all(), required=False, write_only=True)

    def get_book_isbn(self, instance):
        return instance.book.isbn_13

    def get_book_title(self, instance):
        return instance.book.title

    class Meta:
        model = DisplayedBook
        fields = ['book', 'display_mode', 'display_count', 'display_order', 'shelf','book_isbn', 'book_title']
        read_only_fields = ['id', 'book_isbn', 'book_title']

class ShelfSerializer(serializers.ModelSerializer):
    displayed_books = DisplayedBookSerializer(many=True)
    shelf_order = serializers.IntegerField(required=False, write_only=True)
    bookcase = serializers.PrimaryKeyRelatedField(queryset=Bookcase.objects.all(), required=False, write_only=True)

    class Meta:
        model = Shelf
        fields = ['displayed_books', 'shelf_order', 'bookcase']
        read_only_fields = ['id']
    
    def create(self, data):
        books = data.pop('displayed_books')
        shelf = Shelf.objects.create(**data)
        self.create_display_books(books, shelf)
        return shelf
    
    def create_display_books(self, books, shelf):
        self.preprocess_display_books(books, shelf)
        serializer = DisplayedBookSerializer(data=books, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
    
    def preprocess_display_books(self, books, shelf):
        for idx, book in enumerate(books):
            book['book'] = book['book'].id
            book['shelf'] = shelf.id
            book['display_order'] = idx

class BookcaseSerializer(serializers.ModelSerializer):
    shelves = ShelfSerializer(many=True)
    creator_username = serializers.SerializerMethodField()

    class Meta:
        model = Bookcase
        fields = ['name', 'width', 'shelves', 'last_edit_date', "creator", "creator_username"]
        read_only_fields = ['id', "creator_username"]

    def get_creator_username(self, instance):
        return instance.creator.username
    
    def create(self, data):
        shelves = data.pop('shelves')
        bookcase = Bookcase.objects.create(**data)
        self.create_shelves(shelves, bookcase)
        return bookcase
    
    def create_shelves(self, shelves, bookcase):
        self.preprocess_shelves(shelves, bookcase)
        serializer = ShelfSerializer(data=shelves, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
    
    def preprocess_shelves(self, shelves, bookcase):
        for idx, shelf in enumerate(shelves):
            shelf['bookcase'] = bookcase.id
            shelf['shelf_order'] = idx
            for idx, book in enumerate(shelf["displayed_books"]):
                book['book'] = book['book'].id

    