from rest_framework import serializers
from rest_framework.exceptions import APIException

from .models import Sale, SalesReconciliation

from books.models import Book
from purchase_orders.models import Purchase, PurchaseOrder


class SaleSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title = serializers.SerializerMethodField()
    id = serializers.IntegerField(required=False)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_retail_price', 'subtotal']
    
    def get_book_title(self, instance):
        return instance.book.title

    def get_subtotal(self, instance):
        return float(format(instance.quantity*instance.unit_retail_price, '.2f'))

class SalesReconciliationSerializer(serializers.ModelSerializer):
    sales = SaleSerializer(many=True)
    num_books = serializers.SerializerMethodField()
    num_unique_books = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = SalesReconciliation
        fields = ['id', 'date', 'sales', 'num_books', 'num_unique_books', 'total_revenue']
        read_only_fields = ['id']
    
    def get_num_books(self, instance):
        num_books = 0
        sales = Sale.objects.filter(sales_reconciliation=instance.id)
        for sale in sales:
            num_books += sale.quantity
        return num_books

    def get_num_unique_books(self, instance):
        unique_books = set()
        sales = Sale.objects.filter(sales_reconciliation=instance.id)
        for sale in sales:
            unique_books.add(sale.book)
        return len(unique_books)
    
    def get_total_revenue(self, instance):
        total_revenue = 0
        sales = Sale.objects.filter(sales_reconciliation=instance.id)
        for sale in sales:
            total_revenue += sale.revenue
        return round(total_revenue, 2)


    def create(self, validated_data):
        sales_data = validated_data.pop('sales')

        # Sanity check if there exists at least one sale in SR
        if(len(sales_data) < 1):
            raise APIException({
                "error": {
                    "query": "SR CREATE",
                    "msg" : "There must be at least one sales in sales reconciliation."
                }
            })
        
        sales_quantities = {}
        for sale_data in sales_data: #check if sale can be made
            print(sale_data)
            sales_quantities[sale_data['book'].id] = sales_quantities.get(sale_data['book'].id, 0) + sale_data['quantity']
        
        for book_id, sell_quantity in sales_quantities.items():
            book_to_sell = Book.objects.get(id=book_id)
            if (book_to_sell.stock - sell_quantity < 0): # not enough books to sell
                raise APIException(f"Not enough books in stock to sell {book_to_sell.title}")
        
        # if we get here, then we have enough books in stock to complete the sales reconciliation, so do it

        sales_reconciliation = SalesReconciliation.objects.create(**validated_data)
        for sale_data in sales_data:
            Sale.objects.create(sales_reconciliation=sales_reconciliation, **sale_data)
        
        # Update books stocks
        for book_id, sell_quantity in sales_quantities.items():
            book_sold = Book.objects.get(id=book_id)
            book_sold.stock -= sell_quantity
            book_sold.save()
        return sales_reconciliation

    def update(self, instance, validated_data):
        sales_update_data = validated_data.pop('sales')
        existing_sales = Sale.objects.filter(sales_reconciliation_id=instance.id)
        existing_sales_ids = set([sale.id for sale in existing_sales])
        print(existing_sales)
        print(existing_sales_ids)

        # Sanity check if there exists at least one sale in SR
        if(len(sales_update_data) < 1):
            raise APIException({
                "error": {
                    "query": "SR UPDATE",
                    "msg" : "There must be at least one sales in sales reconciliation."
                }
            })
        
        sales_to_delete_ids = existing_sales_ids.copy()
        books_stock_change = {}
        for sale_data in sales_update_data:
            sale_id = sale_data.get('id', None)
            if sale_id:  # Sale already exists
                # book doesnt change
                update_sale_book = sale_data['book']
                prev_sale_book = Sale.objects.get(id=sale_data['id']).book
                if (prev_sale_book.id == update_sale_book.id):
                    sales_to_delete_ids.discard(sale_id)
                    new_quantity = sale_data['quantity']
                    old_quantity = Sale.objects.get(id=sale_id).quantity
                    curr_book_stock = sale_data.get('book').stock
                    books_stock_change[update_sale_book.id] = old_quantity - new_quantity
                else:
                    books_stock_change[sale_data['book'].id] = books_stock_change.get(sale_data['book'].id, 0) - sale_data['quantity']

            else:
                books_stock_change[sale_data['book'].id] = books_stock_change.get(sale_data['book'].id, 0) - sale_data['quantity']
        
        for sale_to_delete_id in sales_to_delete_ids:
            sale_to_delete = Sale.objects.get(id=sale_to_delete_id)
            book_quantity_gain = sale_to_delete.quantity
            book_gaining_stock = sale_to_delete.book
            books_stock_change[book_gaining_stock.id] = books_stock_change.get(book_gaining_stock.id, 0) + book_quantity_gain

        print(books_stock_change)

        for book_id, stock_diff in books_stock_change.items():
            if(Book.objects.get(id=book_id).stock + stock_diff < 0):
                raise APIException("Cannot do update because would cause a book stock to be negative.")
        
        for sale_data in sales_update_data:
            sale_id = sale_data.get('id', None)
            if sale_id:
                self.update_sale(instance, sale_data, sale_id)
                existing_sales_ids.remove(sale_id)
            else:  # Sale doesn't exist, so create it
                Sale.objects.create(sales_reconciliation=instance, **sale_data)

        for old_sale_id in existing_sales_ids:
            old_sale = Sale.objects.get(id=old_sale_id)
            old_sale.delete()

        for book_id, stock_diff in books_stock_change.items():
            book_to_update = Book.objects.get(id=book_id)
            book_to_update.stock += stock_diff
            book_to_update.save()

        # # Remove all old sales not included in updated sales list
        # for old_sale_id in existing_sales_ids:
        #     old_sale = Sale.objects.get(id=old_sale_id)
        #     old_sale.delete()
        self.update_non_nested_fields(instance, validated_data)
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

