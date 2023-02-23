from rest_framework import serializers
from rest_framework.exceptions import APIException
from books.models import Book
from django.db import models
from abc import abstractmethod


class TransactionBaseSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    book_title = serializers.SerializerMethodField()
    id = serializers.IntegerField(required=False)
    subtotal = serializers.SerializerMethodField()

    def get_book_title(self, instance):
        return instance.book.title

    def get_subtotal(self, instance):
        try:
            price = instance.unit_wholesale_price
        except AttributeError:
            try:
                price = instance.unit_retail_price
            except AttributeError:
                price = instance.unit_buyback_price

        return float(format(instance.quantity * price, '.2f'))


class TransactionGroupBaseSerializer(serializers.ModelSerializer):
    num_books = serializers.SerializerMethodField()
    num_unique_books = serializers.SerializerMethodField()

    @abstractmethod
    def get_price_name(self) -> str:
        pass

    @abstractmethod
    def get_transaction_model(self) -> models.Model:
        pass

    @abstractmethod
    def get_transaction_group_model(self) -> models.Model:
        pass

    @abstractmethod
    def get_measure_name(self) -> str:
        pass

    @abstractmethod
    def get_transaction_group_name(self) -> str:
        pass

    @abstractmethod
    def get_transaction_name(self, plural=False) -> str:
        pass

    @abstractmethod
    def update_transaction(self, instance, transaction_data, transaction_id) -> None:
        pass

    @abstractmethod
    def update_non_nested_fields(self, instance, validated_data):
        pass

    @abstractmethod
    def validate_before_creation(self, transaction_quantities, date):
        pass

    def get_num_books(self, instance):
        num_books = 0
        transactions = self.get_transaction_model().objects.filter(**{self.get_transaction_group_name(): instance.id})
        for transaction in transactions:
            num_books += transaction.quantity
        return num_books

    def get_num_unique_books(self, instance):
        unique_books = set()
        transactions = self.get_transaction_model().objects.filter(**{self.get_transaction_group_name(): instance.id})
        for transaction in transactions:
            unique_books.add(transaction.book)
        return len(unique_books)

    def get_total_of_transactions(self, instance):
        total = 0
        transactions = self.get_transaction_model().objects.filter(**{self.get_transaction_group_name(): instance.id})
        for transaction in transactions:
            total += getattr(transaction, self.get_measure_name())
        return round(total, 2)

    def update(self, instance, validated_data):
        transactions_update_data = validated_data.pop(self.get_transaction_name(plural=True))  # Get list of transaction info to use to do update

        existing_transactions = self.get_transaction_model().objects.filter(**{self.get_transaction_group_name(): instance.id})  # Get the existing transactions in this transaction group

        # Check to make sure no books in the transaction group that is being updated have been deleted
        # Will block this operation if this is the case, even if that specific transaction isn't being changed.
        self.check_for_ghost_books([t['book'] for t in transactions_update_data])
        self.check_for_ghost_books([t.book for t in existing_transactions])

        existing_transactions_ids = set([transaction.id for transaction in existing_transactions])
        transactions_to_delete_ids = existing_transactions_ids.copy()  # set of ids which at the end will contain the ids of transactions to delete. We will remove ids that shouldn't be deleted
        books_stock_change = {}  # Holds how a given book's stock will change due to this update, which will be used to check validity later
        for transaction_data in transactions_update_data:
            transaction_id = transaction_data.get('id', None)
            if transaction_id:  # transaction already exists
                self.handle_existing_transaction(transactions_to_delete_ids, books_stock_change, transaction_data, transaction_id)
            else:
                books_stock_change[transaction_data['book'].id] = self.calculate_updated_stock_on_new_transaction(books_stock_change, transaction_data)

        # For the transactions to delete, determine the book stock resulting from deleting each of them
        for transaction_to_delete_id in transactions_to_delete_ids:
            transaction_to_delete = self.get_transaction_model().objects.get(id=transaction_to_delete_id)
            book = transaction_to_delete.book
            quantity = transaction_to_delete.quantity
            books_stock_change[book.id] = books_stock_change.get(book.id, 0) + (quantity * (-1 if self.get_measure_name() == "cost" else 1))

        # Check if transactions would create negative book inventory
        for book_id, stock_diff in books_stock_change.items():
            if Book.objects.get(id=book_id).stock + stock_diff < 0:
                raise APIException("Cannot do update because would cause a book stock to become negative.")

        # ****** IF THIS POINT IS REACHED, WE HAVE DETERMINED THAT THE UPDATE CAN BE DONE SUCCESSFULLY ******

        for transaction_data in transactions_update_data:  # For each transaction data given, actually update the database now
            transaction_id = transaction_data.get('id', None)
            if transaction_id:  # Transaction already exists
                self.update_transaction(instance, transaction_data, transaction_id)
                existing_transactions_ids.remove(transaction_id)
            else:  # Transaction doesn't exist, so create it
                self.get_transaction_model().objects.create(**{self.get_transaction_group_name(): instance}, **transaction_data)

        # Delete any old transactions in database
        for old_transaction_id in existing_transactions_ids:
            old_transaction = self.get_transaction_model().objects.get(id=old_transaction_id)
            old_transaction.delete()

        # update book stocks in database
        for book_id, stock_diff in books_stock_change.items():
            book_to_update = Book.objects.get(id=book_id)
            book_to_update.stock += stock_diff
            book_to_update.save()

        # Update the non-nested fields in the database (e.g. date)
        self.update_non_nested_fields(instance, validated_data)
        return instance

    def check_for_ghost_books(self, books_list):
        for book in set(books_list):
            if book.isGhost:
                raise serializers.ValidationError(f'{book.title} was previously deleted. Please add it to books list again.')

    def handle_existing_transaction(self, transactions_to_delete_ids, books_stock_change, transaction_data, transaction_id):
        # Two possible cases may occur:
        update_transaction_book = transaction_data["book"]
        previous_transaction_book = self.get_transaction_model().objects.get(id=transaction_data["id"]).book
        # Case 1. Book isn't being changed
        if (previous_transaction_book.id == update_transaction_book.id):
            transactions_to_delete_ids.discard(transaction_id)
            new_quantity = transaction_data['quantity']
            old_quantity = self.get_transaction_model().objects.get(id=transaction_id).quantity
            lose_books = old_quantity - new_quantity
            gain_books = -lose_books
            books_stock_change[
                update_transaction_book.id] = gain_books if self.get_measure_name() == "cost" else lose_books  # if it cost you money, you bought books. If you made money, you sold books
        else:  # Case 2. Book is being changed, so treat transaction as a packaged operation of a deletion followed by a creation
            books_stock_change[transaction_data['book'].id] = self.calculate_updated_stock_on_new_transaction(books_stock_change, transaction_data)

    def calculate_updated_stock_on_new_transaction(self, books_stock_change, transaction_data):
        """Determines what the stock of a given book will be after a given transaction is updated"""
        return books_stock_change.get(transaction_data['book'].id, 0) + (transaction_data['quantity'] * (-1 if self.get_measure_name() == "revenue" else 1))

    def create(self, data):
        transactions_data = data.pop(self.get_transaction_name(plural=True))
        transaction_quantities = {}
        for transaction_data in transactions_data:
            transaction_quantities[transaction_data['book'].id] = transaction_quantities.get(transaction_data['book'].id, 0) + (
                transaction_data['quantity'] * (-1 if self.get_measure_name() == "revenue" else 1))  # negative if sale, positive if purchase

        self.validate_before_creation(transaction_quantities, data['date'])

        #Check that books aren't ghosted
        for transaction_data in transactions_data:
            book_obj = transaction_data['book']
            if book_obj.isGhost:
                raise APIException()  # exception based on casey

        # AT THIS POINT, WE HAVE CONFIRMED WE CAN CREATE THE TRANSACTION GROUP

        transaction_group = self.get_transaction_group_model().objects.create(**data)
        for transaction_data in transactions_data:
            self.get_transaction_model().objects.create(**{self.get_transaction_group_name(): transaction_group}, **transaction_data)

        # Update book stocks
        for book_id, transaction_quantity in transaction_quantities.items():
            book = Book.objects.get(id=book_id)
            book.stock += transaction_quantity
            book.save()

        return transaction_group