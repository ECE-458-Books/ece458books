from rest_framework import serializers
from collections import OrderedDict

from .models import Book, Author, BookImage
from genres.models import Genre
from vendors.models import Vendor
from purchase_orders.models import Purchase, PurchaseOrder
from django.db.models import F, Max


class BookListAddSerializer(serializers.ModelSerializer):
    """BookAddSerializer used for ListCreateBookAPIView

    *Note
    If read_only_fields are set, we cannot create a new book to add to DB.
    This is a simple work-around to solve this issue by using different serializers 
    when adding a book and editing a book.

    """
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')
    url = serializers.StringRelatedField()
    best_buyback_price = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'authors', 'genres', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate', 'pageCount', 'width', 'height', 'thickness', 'retail_price', 'isGhost', 'stock', 'url',
            'best_buyback_price'
        ]

    def to_representation(self, instance):
        result = super(BookListAddSerializer, self).to_representation(instance)
        return OrderedDict([(key, result[key]) for key in result if result[key] is not None])

    def get_best_buyback_price(self, instance):
        purchases_of_book = Purchase.objects.filter(book=instance.id)
        purchases_of_book = purchases_of_book.annotate(vendor_id=F('purchase_order__vendor'))
        purchases_of_book = purchases_of_book.annotate(date=F('purchase_order__date'))
        purchases_of_book = purchases_of_book.annotate(buyback_rate=F('purchase_order__vendor__buyback_rate'))
        purchases_of_book = purchases_of_book.order_by('vendor_id', '-purchase_order__date')
        most_recent_purchase_of_book_by_vendor = purchases_of_book.distinct('vendor_id')
        recent_purchases_info = most_recent_purchase_of_book_by_vendor.values('buyback_rate', 'unit_wholesale_price', 'vendor_id')
        recent_purchases_info = recent_purchases_info.annotate(buyback_price=F('buyback_rate') * F('unit_wholesale_price') * .01)
        recent_vendor_purchase_buyback_price = list(recent_purchases_info.values('vendor_id', 'buyback_price'))
        buyback_prices = [purchase['buyback_price'] for purchase in recent_vendor_purchase_buyback_price if purchase['buyback_price'] is not None]
        try:
            return max(buyback_prices)
        except:
            return None


class BookSerializer(serializers.ModelSerializer):
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')
    url = serializers.StringRelatedField()
    best_buyback_price = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ['title', 'authors', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate', 'url', 'best_buyback_price']

    def to_representation(self, instance):
        result = super(BookSerializer, self).to_representation(instance)
        return OrderedDict([(key, result[key]) for key in result if result[key] is not None])

    def get_best_buyback_price(self, instance):
        purchases_of_book = Purchase.objects.filter(book=instance.id)
        purchases_of_book = purchases_of_book.annotate(vendor_id=F('purchase_order__vendor'))
        purchases_of_book = purchases_of_book.annotate(date=F('purchase_order__date'))
        purchases_of_book = purchases_of_book.annotate(buyback_rate=F('purchase_order__vendor__buyback_rate'))
        purchases_of_book = purchases_of_book.order_by('vendor_id', '-purchase_order__date')
        most_recent_purchase_of_book_by_vendor = purchases_of_book.distinct('vendor_id')
        recent_purchases_info = most_recent_purchase_of_book_by_vendor.values('buyback_rate', 'unit_wholesale_price', 'vendor_id')
        recent_purchases_info = recent_purchases_info.annotate(buyback_price=F('buyback_rate') * F('unit_wholesale_price') * .01)
        recent_vendor_purchase_buyback_price = list(recent_purchases_info.values('vendor_id', 'buyback_price'))
        buyback_prices = [purchase['buyback_price'] for purchase in recent_vendor_purchase_buyback_price if purchase['buyback_price'] is not None]
        try:
            return max(buyback_prices)
        except:
            return None


class AuthorSerializer(serializers.ModelSerializer):
    book_list = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Author
        fields = '__all__'


class ISBNSerializer(serializers.Serializer):
    isbns = serializers.CharField()


class BookImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = BookImage
        fields = '__all__'