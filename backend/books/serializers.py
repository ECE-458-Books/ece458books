from rest_framework import serializers

from .models import Book, Author, Genre

class BookSerializer(serializers.ModelSerializer):
    """Serializes Book Creation and Details"""
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')

    class Meta:
        model = Book
        # List all fields that could be included in the request
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    book_list = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Author 
        fields = '__all__'
