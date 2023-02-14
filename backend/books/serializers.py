from rest_framework import serializers

from .models import Book, Author
from genres.models import Genre

class BookListSerializer(serializers.ModelSerializer):
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')

    class Meta:
        model = Book
        fields = '__all__'
        # fields = ['id', 'title', 'authors', 'genres', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate', 'pageCount', 'width', 'height', 'thickness', 'retail_price', 'stock']


class BookAddSerializer(serializers.ModelSerializer):
    """BookAddSerializer used for ListCreateBookAPIView

    *Note
    If read_only_fields are set, we cannot create a new book to add to DB.

    """
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')

    class Meta:
        model = Book
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ['title', 'authors', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate']

class AuthorSerializer(serializers.ModelSerializer):
    book_list = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Author 
        fields = '__all__'

class ISBNSerializer(serializers.Serializer):
    isbns = serializers.CharField()