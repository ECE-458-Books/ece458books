from rest_framework import serializers
from collections import OrderedDict

from .models import Book, Author, BookImage
from genres.models import Genre
from purchase_orders.models import Purchase
from sales.models import Sale
from buybacks.models import Buyback
from django.db.models import F, Sum, Value, CharField
import datetime


class BookListAddSerializer(serializers.ModelSerializer):
    """BookAddSerializer used for ListCreateBookAPIView

    *Note
    If read_only_fields are set, we cannot create a new book to add to DB.
    This is a simple work-around to solve this issue by using different serializers 
    when adding a book and editing a book.

    """
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')
    image_url = serializers.StringRelatedField()
    best_buyback_price = serializers.SerializerMethodField()
    last_month_sales = serializers.SerializerMethodField()
    shelf_space = serializers.SerializerMethodField()
    days_of_supply = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'authors', 'genres', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate', 'pageCount', 'width', 'height', 'thickness', 'retail_price', 'isGhost', 'stock', 'image_url',
            'best_buyback_price', 'last_month_sales', 'shelf_space', 'days_of_supply'
        ]

    def to_representation(self, instance):
        result = super(BookListAddSerializer, self).to_representation(instance)
        return OrderedDict([(key, result[key]) for key in result if result[key] is not None])

    def get_last_month_sales(self, instance):
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        last_month_sales = Sale.objects.filter(sales_reconciliation__date__range=(start_date, end_date)).filter(book=instance.id)
        last_month_sales = last_month_sales.aggregate(Sum('quantity'))['quantity__sum']
        return last_month_sales if last_month_sales else 0

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
            return round(max(buyback_prices),2)
        except:
            return None
        
    def get_shelf_space(self, instance):
        default_thickness = 0.8
        thickness = default_thickness if instance.thickness is None else instance.thickness
        return round(thickness*instance.stock, 2)

    def get_days_of_supply(self, instance):
        stock = instance.stock
        last_month_sales = self.get_last_month_sales(instance)
        if(last_month_sales == 0):
            return "inf"
        return round((stock/last_month_sales)*30, 2)


class BookSerializer(serializers.ModelSerializer):
    authors = serializers.SlugRelatedField(queryset=Author.objects.all(), many=True, slug_field='name')
    genres = serializers.SlugRelatedField(queryset=Genre.objects.all(), many=True, slug_field='name')
    image_url = serializers.StringRelatedField()
    best_buyback_price = serializers.SerializerMethodField()
    last_month_sales = serializers.SerializerMethodField()
    line_items = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ['title', 'authors', 'isbn_13', 'isbn_10', 'publisher', 'publishedDate', 'image_url', 'best_buyback_price', 'last_month_sales']

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

    def get_last_month_sales(self, instance):
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        last_month_sales = Sale.objects.filter(sales_reconciliation__date__range=(start_date, end_date)).filter(book=instance.id)
        last_month_sales = last_month_sales.aggregate(Sum('quantity'))['quantity__sum']
        return last_month_sales if last_month_sales else 0

    def get_line_items(self, instance):
        purchases = Purchase.objects.filter(book=instance.id).annotate(date=F('purchase_order__date')).annotate(vendor=F('purchase_order__vendor')).annotate(
            vendor_name=F('purchase_order__vendor__name')).annotate(unit_price=F('unit_wholesale_price')).annotate(type=Value("purchase order", CharField())).values(
                'purchase_order', 'date', 'vendor', 'vendor_name', 'unit_price', 'quantity', 'type')
        purchases = list(purchases)
        for purchase in purchases:
            purchase['id'] = purchase.pop('purchase_order')

        sales = Sale.objects.filter(book=instance.id).annotate(date=F('sales_reconciliation__date')).annotate(unit_price=F('unit_retail_price')).annotate(
            type=Value("sales reconciliation", CharField())).values('sales_reconciliation', 'date', 'unit_price', 'quantity', 'type')

        sales = list(sales)
        for sale in sales:
            sale['id'] = sale.pop('sales_reconciliation')

        buybacks = Buyback.objects.filter(book=instance.id).annotate(date=F('buyback_order__date')).annotate(vendor=F('buyback_order__vendor')).annotate(
            vendor_name=F('buyback_order__vendor__name')).annotate(unit_price=F('unit_buyback_price')).annotate(type=Value("buyback order", CharField())).values(
                'buyback_order', 'date', 'vendor', 'vendor_name', 'unit_price', 'quantity', 'type')

        buybacks = list(buybacks)
        for buyback in buybacks:
            buyback['id'] = buyback.pop('buyback_order')

        items = purchases + sales + buybacks
        for item in items:
            item['date'] = item['date'].strftime('%Y-%m-%d')
        return items


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
