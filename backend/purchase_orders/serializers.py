from rest_framework import serializers
from books.models import Book
from .models import Purchase, PurchaseOrder
from vendors.models import Vendor
from vendors.serializers import VendorSerializer

class PurchaseSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Purchase
        fields = ['id', 'book', 'quantity', 'unit_wholesale_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    purchases = PurchaseSerializer(many=True)
    # vendor = VendorSerializer()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'date', 'purchases', 'vendor']
        read_only_fields = ['id']

    def create(self, validated_data):
        print(validated_data)
        purchases_data = validated_data.pop('purchases')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        for purchase_data in purchases_data:
            Purchase.objects.create(purchase_order=purchase_order, **purchase_data)
        return purchase_order
    
    def update(self, instance, validated_data):
        purchases_update_data = validated_data.pop('purchases')
        self.update_non_nested_fields(instance, validated_data)

        existing_purchases = Purchase.objects.filter(purchase_order_id=instance.id)
        existing_purchases_ids = set([purchase.id for purchase in existing_purchases])
        for purchase_data in purchases_update_data:
            purchase_id = purchase_data.get('id', None)
            if purchase_id:  # Purchase already exists
                existing_purchases_ids.remove(purchase_id)
                self.update_purchase(instance, purchase_data, purchase_id)
            else:  # Purchase doesn't exist, so create it
                Purchase.objects.create(purchase_order=instance, **purchase_data)

        # Remove all old sales not included in updated sales list
        for old_purchase_id in existing_purchases_ids:
            old_purchase = Purchase.objects.get(id=old_purchase_id)
            old_purchase.delete()
        return instance

    def update_non_nested_fields(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.vendor = validated_data.get('vendor', instance.vendor)
        instance.save()

    def update_purchase(self, instance, purchase_data, purchase_id):
        purchase = Purchase.objects.get(id=purchase_id, purchase_order=instance)
        purchase.book = purchase_data.get('book', purchase.book)
        purchase.quantity = purchase_data.get('quantity', purchase.quantity)
        purchase.unit_wholesale_price = purchase_data.get('unit_wholesale_price', purchase.unit_wholesale_price)
        purchase.save()
        