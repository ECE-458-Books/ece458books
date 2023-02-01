from rest_framework import serializers
from books.models import Book
from .models import Sale, SalesReconciliation


class SaleSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())

    class Meta:
        model = Sale
        fields = ['book', 'quantity', 'unit_retail_price']


class SalesReconciliationSerializer(serializers.ModelSerializer):
    sales = SaleSerializer(many=True)

    class Meta:
        model = SalesReconciliation
        fields = ['id', 'date', 'sales']
        read_only_fields = ['id']

    def create(self, validated_data):
        sales_data = validated_data.pop('sales')
        sales_reconciliation = SalesReconciliation.objects.create(**validated_data)
        for sale_data in sales_data:
            Sale.objects.create(sales_reconciliation=sales_reconciliation, **sale_data)
        return sales_reconciliation
