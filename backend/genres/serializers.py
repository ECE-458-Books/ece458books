from rest_framework import serializers

from .models import Genre

class GenreSerializer(serializers.ModelSerializer):
    books = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    book_cnt = serializers.SerializerMethodField('calc_book_cnt', required=False)

    class Meta:
        model = Genre
        fields = ['id', 'name', 'books', 'book_cnt']
    
    def calc_book_cnt(self, obj):
        if(hasattr(obj, 'book_cnt')):
            return obj.book_cnt
        return None