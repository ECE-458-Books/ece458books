from rest_framework import serializers
from rest_framework.exceptions import APIException
from django.db.models import Sum

from .models import Purchase, PurchaseOrder

from books.models import Book
from vendors.models import Vendor
from vendors.serializers import VendorSerializer

class PurchaseSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title = serializers.SerializerMethodField()
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Purchase
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_wholesale_price']

    def get_book_title(self, instance):
        return instance.book.title

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
            self.create_update_stock(purchase_data)
            Purchase.objects.create(purchase_order=purchase_order, **purchase_data)
        return purchase_order

    def create_update_stock(self, purchase_data):
        book_obj = purchase_data['book']
        # Sanity check if the book is not ghost
        if(book_obj.isGhost):
            raise APIException({
                "error": {
                    "query": "PO CREATE",
                    "msg": f"Please Add Book title: {book_obj.title} and id: {book_obj.id} to the Inventory Before Creating Purchase Orders"
                }
            })

        book_obj.stock += purchase_data['quantity']
        book_obj.save()
    
    def update(self, instance, validated_data):
        purchases_update_data = validated_data.pop('purchases')

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

        # Inventory Count for Books
        # Case 1. Purchase already exists so we update the purchase (meaning the equation: stock + (new-origial) should be checked for below 0)
        # Case 2. This is creating a new Purchase Order in which we do not care about stock going below zero.
        # Case 3. Deleting previous purchase orders -> This can lead to stock to go below zero so check.

        purchases_to_delete_ids = existing_purchases_ids.copy()
        for purchase_data in purchases_update_data:
            purchase_id = purchase_data.get('id', None)
            if purchase_id: # Purchase already exists
                purchases_to_delete_ids.discard(purchase_id)
                # Check if can replace old purchase with new purchase and still have positive book stock
                new_quantity = purchase_data['quantity']
                old_quantity = Purchase.objects.get(id=purchase_id, purchase_order=instance).quantity
                curr_book_stock = purchase_data.get('book').stock
                if (curr_book_stock + (new_quantity - old_quantity) < 0): # problematic
                    raise APIException("Cannot do update because would cause a book stock to be negative.")
            else: # Must create new purchase order, which will never cause stock to go below zero
                pass

        for purchase_to_delete_id in purchases_to_delete_ids:
            purchase_to_delete = Purchase.objects.get(id=purchase_to_delete_id)
            book_quantity_loss = purchase_to_delete.quantity
            book_losing_stock = purchase_to_delete.book
            if (book_losing_stock.stock - book_quantity_loss < 0): # problematic
                raise APIException("Cannot do update because would cause a book stock to be negative.")

        # purchase_book_quantities = Purchase.objects.filter(purchase_order=instance.id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        

        return ""
        for purchase_data in purchases_update_data:
            purchase_id = purchase_data.get('id', None)
            if purchase_id:  # Purchase already exists
                self.update_purchase(instance, purchase_data, purchase_id) # Case 1.
                existing_purchases_ids.remove(purchase_id)
            else:  # Purchase doesn't exist, so create it
                Purchase.objects.create(purchase_order=instance, **purchase_data)

                # Add to stock of Book
                purchase_data.get('book').stock += purchase_data.get('quantity')
                purchase_data.get('book').save()

        # Remove all old sales not included in updated sales list

        # The given input is a list of existing_purchases_ids
        # Each purchase object has a quantity of the book associated.
        # We need to transform this to a list of (book, quantity) tuple to check if deleting the whole thing is fine

        purchase_book_quantities = Purchase.objects.filter(purchase_order=instance.id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        existing_purchases_ids
        for purchase_book_quantity in purchase_book_quantities:
            book_to_remove_purchase = Book.objects.filter(id=purchase_book_quantity['book']).get()
            if (book_to_remove_purchase.stock < purchase_book_quantity['num_books']):
                return Response({"error": {
                    "msg": "Cannot delete purchase order, as doing so would cause book stock to become negative.",
                    "details": {
                        "book_id": purchase_book_quantity['book'],
                        "book_stock": book_to_remove_purchase.stock,
                        "quantity_request_for_delete": purchase_book_quantity['num_books']
                    }
                    } 
                },
                status=status.HTTP_403_FORBIDDEN)

        for old_purchase_id in existing_purchases_ids:
            old_purchase = Purchase.objects.get(id=old_purchase_id)
            old_purchase.delete()
        
        # If this purchase order modify is valid then we update non_nested_fields
        self.update_non_nested_fields(instance, validated_data)
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
        