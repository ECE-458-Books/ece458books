from rest_framework import serializers
from .models import Sale, SalesReconciliation
from helpers.base_serializers import TransactionBaseSerializer, TransactionGroupBaseSerializer
from django.db import models
from books.models import Book


class SaleSerializer(TransactionBaseSerializer):

    class Meta:
        model = Sale
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_retail_price', 'subtotal']


class SalesReconciliationSerializer(TransactionGroupBaseSerializer):
    sales = SaleSerializer(many=True)
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = SalesReconciliation
        fields = ['id', 'date', 'sales', 'num_books', 'num_unique_books', 'total_revenue']
        read_only_fields = ['id']

    def get_price_name(self):
        return "unit_retail_price"

    def get_transaction_model(self):
        return Sale

    def get_transaction_group_model(self) -> models.Model:
        return SalesReconciliation

    def get_measure_name(self) -> str:
        return "revenue"

    def get_transaction_group_name(self) -> str:
        return "sales_reconciliation"

    def get_transaction_name(self, plural=False) -> str:
        transaction_name = "sale"
        return f'{transaction_name}s' if plural else transaction_name

    def get_total_revenue(self, instance):
        return super().get_total_of_transactions(instance)

    def update_transaction(self, instance, transaction_data, transaction_id) -> None:
        self.__update_sale(instance, transaction_data, transaction_id)

    def validate_before_creation(self, transaction_quantities):
        for book_id, sell_quantity in transaction_quantities.items():
            book_to_sell = Book.objects.get(id=book_id)
            if (book_to_sell.stock + sell_quantity < 0):  # not enough books to sell
                raise serializers.ValidationError(f"Not enough books in stock to sell {book_to_sell.title}")

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.save()

    def __update_sale(self, instance, sale_data, sale_id):
        sale = Sale.objects.get(id=sale_id, sales_reconciliation=instance)
        sale.book = sale_data.get('book', sale.book)
        sale.quantity = sale_data.get('quantity', sale.quantity)
        sale.unit_retail_price = sale_data.get('unit_retail_price', sale.unit_retail_price)
        sale.save()
