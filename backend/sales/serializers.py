from collections import OrderedDict

from django.db import models
from django.db.models import Subquery, OuterRef
from rest_framework import serializers

from helpers.base_serializers import TransactionBaseSerializer, TransactionGroupBaseSerializer
from books.models import Book
from purchase_orders.models import PurchaseOrder, Purchase

from .models import Sale, SalesReconciliation

class SaleSerializer(TransactionBaseSerializer):

    class Meta:
        model = Sale
        fields = ['id', 'book', 'book_isbn', 'book_title', 'quantity', 'unit_retail_price']


class SalesReconciliationSerializer(TransactionGroupBaseSerializer):
    sales = SaleSerializer(many=True)
    username = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    is_deletable = serializers.SerializerMethodField()
    is_sales_record = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = SalesReconciliation
        fields = ['id', 'date', 'user', 'username', 'sales', 'num_books', 'num_unique_books', 'total_revenue', 'is_deletable', 'is_sales_record']
        read_only_fields = ['id']

    def to_representation(self, instance):
        result = super(SalesReconciliationSerializer, self).to_representation(instance)
        return OrderedDict([(key, result[key]) for key in result if result[key] is not None])

    def get_is_deletable(self, instance):
        # only way you can't delete is a sale is if the book is ghost
        sales_to_delete = Sale.objects.filter(sales_reconciliation=instance.id)
        for sale in sales_to_delete:
            book_to_remove_sale = Book.objects.filter(id=sale.book.id).get()
            if (book_to_remove_sale.isGhost):
                return False
        return True

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

    def get_username(self, instance):
        if instance.user:
            return instance.user.username

        return None

    def get_total_revenue(self, instance):
        return super().get_total_of_transactions(instance)

    def update_transaction(self, instance, transaction_data, transaction_id) -> None:
        self.__update_sale(instance, transaction_data, transaction_id)

    def validate_before_creation(self, transaction_quantities, data):
        date = data['date']
        # Currently just says first sale with issue, but can tell all sales with issues after Casey defines errors
        for book_id, sell_quantity in transaction_quantities.items():
            book_to_sell = Book.objects.get(id=book_id)

            # Check that book has been previously purchased
            has_previous_purchase = self.__book_has_previous_purchase(date, book_id)
            if not has_previous_purchase:
                raise serializers.ValidationError(f'{book_to_sell.title} has not been previously purchased')

            # Check that book has enough stock to be bought
            if (book_to_sell.stock + sell_quantity < 0):  # not enough books to sell
                raise serializers.ValidationError(f"Not enough books in stock to sell {book_to_sell.title}")

    def __book_has_previous_purchase(self, date, book_id):
        try:
            return PurchaseOrder.objects.filter(date__lte=date).annotate(
                prev_purchase=Subquery(Purchase.objects.filter(purchase_order=OuterRef('id')).filter(book=book_id).distinct('purchase_order').values('book'))).values('prev_purchase').exclude(
                    prev_purchase=None).first()['prev_purchase'] != None
        except TypeError:
            return None

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.save()

    def __update_sale(self, instance, sale_data, sale_id):
        sale = Sale.objects.get(id=sale_id, sales_reconciliation=instance)
        sale.book = sale_data.get('book', sale.book)
        sale.quantity = sale_data.get('quantity', sale.quantity)
        sale.unit_retail_price = sale_data.get('unit_retail_price', sale.unit_retail_price)
        sale.save()


class SalesRecordSerializer(SalesReconciliationSerializer):
    is_sales_record = serializers.BooleanField(required=False, default=True)

    def validate_before_creation(self, transaction_quantities, data):
        pass
