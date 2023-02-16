from rest_framework import serializers
from rest_framework.exceptions import APIException
from .models import Purchase, PurchaseOrder
from books.models import Book
from exceptions.exceptions import BookNotInInventoryException, NoPurchaseInPurchaseOrderException, NegativeBookStockException


class PurchaseSerializer(serializers.ModelSerializer):
    """Serializes a singular purchase that is part of a purchase order into the following fields:
    - id: id of the purchase from auto-incremented value in DB.
    - book: pk of the book purchased.
    - book_title: title of the book purchased.
    - quantity: The total number of books purchased in this purchase.
    - unit_wholesale_price: The cost per book in this purchase
    - subtotal: the total cost of this singular purchase. Calculated by multiplying the unit_wholesale_price by the quantity.
    """
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
        return round(instance.quantity * instance.unit_wholesale_price, 2)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """Serializes a single purchase order into the following fields:
    - id: id of the purchase order from auto-incremented value in DB.
    - date: The date this purchase order was made. Retrieved from DB table.
    - purchases: A list of serialized purchases using the PurchaseSerializer.
    - vendor: The id of the vendor fulfilling this purchase order from the auto-incremented value in the vendor DB table.
    - vendor_name: The name of the vendor that this purchase order is with.
    - num_books: The number of total books purchased in this purchase order.
    - num_unique_books: The number of UNIQUE books purchased in this purchase order.
    - total_cost: The total cost of this purchase order. Calculated by summing the subtotals of all the purchases.

    Raises:
        NoPurchaseInPurchaseOrderException: raised if there exists no purchases in the purchase order
        BookNotInInventoryException: raised if the book attempting to be updated is ghosted (i.e. deleted)
        NegativeBookStockException: raised if the operation would cause a book's stock to become negative
        
    """
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
        if (len(purchases_data) < 1):
            raise NoPurchaseInPurchaseOrderException()

        purchase_order = PurchaseOrder.objects.create(**validated_data)
        for purchase_data in purchases_data:
            self.create_update_stock(purchase_data)
            Purchase.objects.create(purchase_order=purchase_order, **purchase_data)
        return purchase_order

    def create_update_stock(self, purchase_data):
        book_obj = purchase_data['book']
        # Sanity check if the book is not ghost
        if (book_obj.isGhost):
            raise BookNotInInventoryException(book_obj.title, book_obj.id, "creating a purchase")
        book_obj.stock += purchase_data['quantity']
        book_obj.save()

    def update(self, instance, validated_data):
        purchases_update_data = validated_data.pop('purchases')
        existing_purchases = Purchase.objects.filter(purchase_order_id=instance.id)
        existing_purchases_ids = set([purchase.id for purchase in existing_purchases])

        # Sanity check if there exists at least one purchase in PO
        if (len(purchases_update_data) < 1):
            raise NoPurchaseInPurchaseOrderException()

        # Inventory Count for Books
        # Case 1. Purchase already exists so we update the purchase (meaning the equation: stock + (new-origial) should be checked for below 0)
        # Case 2. This is creating a new Purchase Order in which we do not care about stock going below zero.
        # Case 3. Deleting previous purchase orders -> This can lead to stock to go below zero so check.

        purchases_to_delete_ids = existing_purchases_ids.copy()
        updated_books_stock = {}
        for purchase_data in purchases_update_data:
            purchase_id = purchase_data.get('id', None)
            if purchase_id:  # Purchase already exists
                # Check if can replace old purchase with new purchase and still have positive book stock
                update_purchase_book = purchase_data['book']
                prev_purchase_book = Purchase.objects.get(id=purchase_data['id']).book
                if (prev_purchase_book.id == update_purchase_book.id):  # CASE 1: Book does not change
                    purchases_to_delete_ids.discard(purchase_id)
                    new_quantity = purchase_data['quantity']
                    old_quantity = Purchase.objects.get(id=purchase_id, purchase_order=instance).quantity
                    updated_books_stock[update_purchase_book.id] = new_quantity - old_quantity
                else:  # book does change, so just treat the purchase as being deleted for purposes of calculating stock
                    updated_books_stock[purchase_data['book'].id] = updated_books_stock.get(
                        purchase_data['book'].id, 0) + purchase_data['quantity']
            else:  # Must create new purchase order, which will never cause stock to go below zero
                updated_books_stock[purchase_data['book'].id] = updated_books_stock.get(purchase_data['book'].id,
                                                                                        0) + purchase_data['quantity']
        self.update_stock_for_purchases_to_delete(purchases_to_delete_ids, updated_books_stock)

        # Check if changes would cause a book's stock to become negative
        for book_id, stock_diff in updated_books_stock.items():
            if (Book.objects.get(id=book_id).stock + stock_diff < 0):  # would cause book stock to be negative
                raise NegativeBookStockException("purchase update")

        # At this point, we know the purchase order would not cause any books' stock to be negative, so can perform update
        self.update_or_create_purchases(instance, purchases_update_data, existing_purchases_ids)
        self.delete_old_purchases(existing_purchases_ids)
        self.update_books_stock(updated_books_stock)

        # Lastly, update the purchase order fields
        self.update_non_nested_fields(instance, validated_data)
        return instance

    def update_or_create_purchases(self, instance, purchases_update_data, existing_purchases_ids):
        for purchase_data in purchases_update_data:
            purchase_id = purchase_data.get('id', None)
            if purchase_id:  # Purchase already exists
                self.update_purchase(instance, purchase_data, purchase_id)  # Case 1.
                existing_purchases_ids.remove(purchase_id)
            else:  # Purchase doesn't exist, so create it
                Purchase.objects.create(purchase_order=instance, **purchase_data)

    def delete_old_purchases(self, existing_purchases_ids):
        for old_purchase_id in existing_purchases_ids:
            old_purchase = Purchase.objects.get(id=old_purchase_id)
            old_purchase.delete()

    def update_books_stock(self, books_stock_change):
        for book_id, stock_diff in books_stock_change.items():  # update stocks
            book_to_update = Book.objects.get(id=book_id)
            book_to_update.stock += stock_diff
            book_to_update.save()

    def update_stock_for_purchases_to_delete(self, purchases_to_delete_ids, books_stock_change):
        for purchase_to_delete_id in purchases_to_delete_ids:
            purchase_to_delete = Purchase.objects.get(id=purchase_to_delete_id)
            book_quantity_loss = purchase_to_delete.quantity
            book_losing_stock = purchase_to_delete.book
            books_stock_change[book_losing_stock.id] = books_stock_change.get(book_losing_stock.id,
                                                                              0) - book_quantity_loss

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
