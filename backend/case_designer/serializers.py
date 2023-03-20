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
        read_only_fields = ['book_isbn', 'book_title']

class ShelfSerializer(serializers.ModelSerializer):
    displayed_books = DisplayedBookSerializer(many=True)
    shelf_order = serializers.IntegerField(required=False, write_only=True)
    bookcase = serializers.PrimaryKeyRelatedField(queryset=Bookcase.objects.all(), required=False, write_only=True)

    class Meta:
        model = Shelf
        fields = ['displayed_books', 'shelf_order', 'bookcase']

    
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
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, required=False)
    last_editor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    creator_username = serializers.SerializerMethodField()
    last_editor_username = serializers.SerializerMethodField()

    class Meta:
        model = Bookcase
        fields = ['id', 'name', 'width', 'shelves', 'last_edit_date', 
                  'creator', 'creator_username', 'last_editor', 'last_editor_username']
        read_only_fields = ['id', 'creator_username', 'last_editor_username']

    def get_creator_username(self, instance):
        return instance.creator.username
    
    def get_last_editor_username(self, instance):
        return instance.last_editor.username
    
    def create(self, data):
        shelves = data.pop('shelves')
        bookcase = Bookcase.objects.create(**data)
        self.create_shelves(shelves, bookcase)
        return bookcase
    
    # The update method deletes/recreates all shelves for the bookcase,
    # and updates the top level fields 
    def update(self, instance, validated_data):
        self.delete_old_shelves(instance)
        new_shelves = validated_data['shelves']
        self.create_shelves(new_shelves, instance)
        self.update_non_nested_fields(instance, validated_data)
        instance.save()
        return instance

    def update_non_nested_fields(self, instance, validated_data):
        instance.name = validated_data['name']
        instance.width = validated_data['width']
        instance.last_editor = validated_data['last_editor']

    def delete_old_shelves(self, bookcase):
        shelves = Shelf.objects.filter(bookcase_id=bookcase.id)
        for shelf in shelves:
            shelf.delete()

    def create_shelves(self, shelves, bookcase):
        self.preprocess_shelves(shelves, bookcase)
        serializer = ShelfSerializer(data=shelves, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
    
    def preprocess_shelves(self, shelves, bookcase):
        for idx, shelf in enumerate(shelves):
            shelf['bookcase'] = bookcase.id
            shelf['shelf_order'] = idx
            for idx, book in enumerate(shelf['displayed_books']):
                book['book'] = book['book'].id

    