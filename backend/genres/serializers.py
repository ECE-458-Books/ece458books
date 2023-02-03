from rest_framework import serializers

from .models import Genre

class GenreSerializer(serializers.ModelSerializer):
    books = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    book_cnt = serializers.SerializerMethodField()

    class Meta:
        model = Genre
        fields = ['id', 'name', 'books', 'book_cnt']
    
    def get_book_cnt(self, obj):
        return obj.real_book_cnt