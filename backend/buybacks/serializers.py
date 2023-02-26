from rest_framework import serializers
from helpers.base_serializers import TransactionBaseSerializer, TransactionGroupBaseSerializer
from .models import Buyback, BuybackOrder
from purchase_orders.models import Purchase, PurchaseOrder
from django.db.models import Subquery, OuterRef
from books.models import Book
from django.db import models


class BuybackSerializer(TransactionBaseSerializer):

    class Meta:
        model = Buyback
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_buyback_price']


class BuybackOrderSerializer(TransactionGroupBaseSerializer):
    buybacks = BuybackSerializer(many=True)
    total_revenue = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = BuybackOrder
        fields = ['id', 'date', 'buybacks', 'vendor', 'vendor_name', 'num_books', 'num_unique_books', 'total_revenue']
        read_only_fields = ['id']

    def get_price_name(self) -> str:
        return "unit_buyback_price"

    def get_transaction_model(self) -> models.Model:
        return Buyback

    def get_transaction_group_model(self) -> models.Model:
        return BuybackOrder

    def get_measure_name(self) -> str:
        return "revenue"

    def get_transaction_group_name(self) -> str:
        return "buyback_order"

    def get_transaction_name(self, plural=False) -> str:
        transaction_name = "buyback"
        return f'{transaction_name}s' if plural else transaction_name

    def get_total_revenue(self, instance):
        return super().get_total_of_transactions(instance)

    def update_transaction(self, instance, transaction_data, transaction_id) -> None:
        self.__update_buyback(instance, transaction_data, transaction_id)

    def get_vendor_name(self, instance):
        return instance.vendor.name

    def validate_before_creation(self, transaction_quantities, date):
        for book_id, buyback_quantity in transaction_quantities.items():
            book_to_buyback = Book.objects.get(id=book_id)

            # Check that book has been previously purchased
            has_previous_purchase = self.__book_has_previous_purchase(date, book_id)
            if not has_previous_purchase:
                raise serializers.ValidationError(f'{book_to_buyback.title} has not been previously purchased')

            # Check that book has enough stock to be bought
            if (book_to_buyback.stock + buyback_quantity < 0):  # not enough books to buyback
                raise serializers.ValidationError(f"Not enough books in stock to buyback {book_to_buyback.title}")

    def __book_has_previous_purchase(self, date, book_id):
        return PurchaseOrder.objects.filter(date__lte=date).annotate(prev_purchase=Subquery(Purchase.objects.filter(purchase_order=OuterRef('id')).filter(
            book=book_id).values('book'))).values('prev_purchase').exclude(prev_purchase=None).first()['prev_purchase'] != None

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.vendor = validated_data.get('vendor', instance.vendor)
        instance.save()

    def __update_buyback(self, instance, buyback_data, buyback_id):
        buyback = Buyback.objects.get(id=buyback_id, buyback_order=instance)
        buyback.book = buyback_data.get('book', buyback.book)
        buyback.quantity = buyback_data.get('quantity', buyback.quantity)
        buyback.unit_buyback_price = buyback_data.get('unit_buyback_price', buyback.unit_buyback_price)
        buyback.save()