from rest_framework import serializers
from books.models import Book
from .models import Sale, SalesReconciliation


class SaleSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Sale
        fields = ['id', 'book', 'quantity', 'unit_retail_price']


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

    def update(self, instance, validated_data):
        sales_update_data = validated_data.pop('sales')
        self.update_non_nested_fields(instance, validated_data)

        existing_sales = Sale.objects.filter(sales_reconciliation_id=instance.id)
        existing_sales_ids = set([sale.id for sale in existing_sales])
        for sale_data in sales_update_data:
            sale_id = sale_data.get('id', None)
            if sale_id:  # Sale already exists
                existing_sales_ids.remove(sale_id)
                self.update_sale(instance, sale_data, sale_id)
            else:  # Sale doesn't exist, so create it
                Sale.objects.create(sales_reconciliation=instance, **sale_data)

        # Remove all old sales not included in updated sales list
        for old_sale_id in existing_sales_ids:
            old_sale = Sale.objects.get(id=old_sale_id)
            old_sale.delete()
        return instance

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.save()

    def update_sale(self, instance, sale_data, sale_id):
        sale = Sale.objects.get(id=sale_id, sales_reconciliation=instance)
        sale.book = sale_data.get('book', sale.book)
        sale.quantity = sale_data.get('quantity', sale.quantity)
        sale.unit_retail_price = sale_data.get('unit_retail_price', sale.unit_retail_price)
        sale.save()
