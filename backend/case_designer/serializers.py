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
        fields = ['book',
                   'display_mode', 'display_count']
        read_only_fields = ['id']

class ShelfSerializer(serializers.ModelSerializer):
    books = DisplayedBookSerializer(many=True)
    ordering = serializers.IntegerField(required=False)
    bookcase = serializers.PrimaryKeyRelatedField(queryset=Bookcase.objects.all(), required=False)

    class Meta:
        model = Shelf
        fields = ['books', "ordering", "bookcase"]
        
    
    def create(self, data):
        books = data.pop('books')
        shelf = Shelf.objects.create(**data)
        return shelf

class BookcaseSerializer(serializers.ModelSerializer):
    # To be completed when users are implemented
    #creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    #last_editor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    shelves = ShelfSerializer(many=True)

    class Meta:
        model = Bookcase
        fields = ['name', 'width', "shelves"
                  # To be completed when users are implemented
                  #'creator', 'last_editor', 
                  ]
        read_only_fields = ['id', 'last_edit_date']

    def create(self, data):
        shelves = data.pop('shelves')
        bookcase = Bookcase.objects.create(**data)
        self.create_shelves(shelves, bookcase)
        return bookcase
    
    def preprocess_shelves(self, shelves, bookcase):
        for idx, shelf in enumerate(shelves):
            shelf["ordering"] = idx
            shelf["bookcase"] = bookcase.id
            for book in shelf["books"]:
                book["book"] = book["book"].id
        return shelves

    def create_shelves(self, shelves, bookcase):
        breakpoint()
        shelves = self.preprocess_shelves(shelves, bookcase)
        serializer = ShelfSerializer(data=shelves, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        #for idx, shelf in enumerate(shelves):
        #    books = shelf.pop("books")
        #    shelf = Shelf.objects.create(**shelf)
        #    self.create_display_books(books, shelf)
        
    def create_display_books(self, books, shelf):
        for idx, book in enumerate(books):
            book["ordering"] = idx
            book["shelf"] = shelf
            DisplayedBook.objects.create(**book)