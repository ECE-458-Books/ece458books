from rest_framework import serializers

from .models import Book, Author, Genre

class BookAddSerializer(serializers.ModelSerializer):
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