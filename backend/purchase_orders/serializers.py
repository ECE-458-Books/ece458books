from rest_framework import serializers
from django.db import models
from .models import Purchase, PurchaseOrder
from helpers.base_serializers import TransactionBaseSerializer, TransactionGroupBaseSerializer
from django.db.models import Sum
from books.models import Book


class PurchaseSerializer(TransactionBaseSerializer):

    class Meta:
        model = Purchase
        fields = ['id', 'book', 'book_isbn', 'book_title', 'quantity', 'unit_wholesale_price']


class PurchaseOrderSerializer(TransactionGroupBaseSerializer):
    purchases = PurchaseSerializer(many=True)
    total_cost = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    is_deletable = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'date', 'purchases', 'vendor', 'vendor_name', 'num_books', 'num_unique_books', 'total_cost', 'is_deletable']
        read_only_fields = ['id']

    def get_is_deletable(self, instance):
        purchase_book_quantities = Purchase.objects.filter(purchase_order=instance.id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        for purchase_book_quantity in purchase_book_quantities:
            book_to_remove_purchase = Book.objects.filter(id=purchase_book_quantity['book']).get()
            if (book_to_remove_purchase.stock < purchase_book_quantity['num_books']) or (book_to_remove_purchase.isGhost):
                return False
        return True

    def get_price_name(self) -> str:
        return "unit_wholesale_price"

    def get_transaction_model(self) -> models.Model:
        return Purchase

    def get_transaction_group_model(self) -> models.Model:
        return PurchaseOrder

    def get_measure_name(self) -> str:
        return "cost"

    def get_transaction_group_name(self) -> str:
        return "purchase_order"

    def get_transaction_name(self, plural=False) -> str:
        transaction_name = "purchase"
        return f'{transaction_name}s' if plural else transaction_name

    def validate_before_creation(self, transaction_quantities, data):
        pass

    def get_total_cost(self, instance):
        return super().get_total_of_transactions(instance)

    def update_transaction(self, instance, transaction_data, transaction_id) -> None:
        self.__update_purchase(instance, transaction_data, transaction_id)

    def get_vendor_name(self, instance):
        return instance.vendor.name

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.vendor = validated_data.get('vendor', instance.vendor)
        instance.save()

    def __update_purchase(self, instance, purchase_data, purchase_id):
        purchase = Purchase.objects.get(id=purchase_id, purchase_order=instance)
        purchase.book = purchase_data.get('book', purchase.book)
        purchase.quantity = purchase_data.get('quantity', purchase.quantity)
        purchase.unit_wholesale_price = purchase_data.get('unit_wholesale_price', purchase.unit_wholesale_price)
        purchase.save()
