from rest_framework import serializers

from .models import Book

class BookSerializer(serializers.ModelSerializer):
    """Serializes Book Creation and Details"""
    class Meta:
        model = Book
        # List all fields that could be included in the request
        fields = '__all__'
        