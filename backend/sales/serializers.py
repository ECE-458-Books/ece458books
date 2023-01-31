from rest_framework import serializers

from books.models import Book
from .models import Sale, SalesReconciliation


class SaleSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())

    # book = serializers.SlugRelatedField(queryset=Book.objects.all(), slug_field='isbn_13')

    class Meta:
        model = Sale
        fields = '__all__'


class SalesReconciliationSerializer(serializers.ModelSerializer):
    sales = SaleSerializer(many=True)

    class Meta:
        model = SalesReconciliation
        fields = '__all__'

    def create(self, validated_data):
        sales = validated_data.pop('sales')
        sales_reconciliation = SalesReconciliation.objects.create(**validated_data)
        for sale in sales:
            Sale.objects.create(**sale)
        return sales_reconciliation