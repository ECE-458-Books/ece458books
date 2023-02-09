from rest_framework import serializers
from rest_framework.exceptions import APIException

from .models import Purchase, PurchaseOrder

from books.models import Book
from vendors.models import Vendor
from vendors.serializers import VendorSerializer

class PurchaseSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title = serializers.SerializerMethodField()
    id = serializers.IntegerField(required=False)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_wholesale_price', 'subtotal']

    def get_book_title(self, instance):
        return instance.book.title
    
    def get_subtotal(self, instance):
        return instance.quantity*instance.unit_wholesale_price


class PurchaseOrderSerializer(serializers.ModelSerializer):
    purchases = PurchaseSerializer(many=True)
    num_books = serializers.SerializerMethodField()
    num_unique_books = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'date', 'purchases', 'vendor', 'vendor_name', 'num_books', 'num_unique_books', 'total_cost']
        read_only_fields = ['id']

    def get_num_books(self, instance):
        num_books = 0
        purchases = Purchase.objects.filter(purchase_order=instance.id)
        for purchase in purchases:
            num_books += purchase.quantity
        return num_books

    def get_num_unique_books(self, instance):
        unique_books = set()
        purchases = Purchase.objects.filter(purchase_order=instance.id)
        for purchase in purchases:
            unique_books.add(purchase.book)
        return len(unique_books)
    
    def get_total_cost(self, instance):
        total_cost = 0
        purchases = Purchase.objects.filter(purchase_order=instance.id)
        for purchase in purchases:
            total_cost += purchase.cost
        return round(total_cost, 2)
    
    def get_vendor_name(self, instance):
        return instance.vendor.name

    def create(self, validated_data):
        purchases_data = validated_data.pop('purchases')

        # Sanity check if there exists at least one sale in PO
        if(len(purchases_data) < 1):
            raise APIException({
                "error": {
                    "query": "PO CREATE",
                    "msg" : "There must be at least one order in Purchase Orders."
                }
            })

        purchase_order = PurchaseOrder.objects.create(**validated_data)
        for purchase_data in purchases_data:
            Purchase.objects.create(purchase_order=purchase_order, **purchase_data)
        return purchase_order
    
    def update(self, instance, validated_data):
        purchases_update_data = validated_data.pop('purchases')
        self.update_non_nested_fields(instance, validated_data)

        existing_purchases = Purchase.objects.filter(purchase_order_id=instance.id)
        existing_purchases_ids = set([purchase.id for purchase in existing_purchases])

        # Sanity check if there exists at least one sale in PO
        if(len(purchases_update_data) < 1):
            raise APIException({
                "error": {
                    "query": "PO MODIFY",
                    "msg" : "There must be at least one order in Purchase Orders."
                }
            })

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
        