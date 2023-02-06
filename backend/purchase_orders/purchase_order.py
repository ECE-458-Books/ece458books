class PurchaseOrderFieldsCalculator:

    @staticmethod
    def add_calculated_fields(data):
        total_cost = 0
        books = set()
        num_books = 0
        for purchase in data['purchases']:
            purchase_cost = purchase['quantity'] * purchase['unit_wholesale_price']
            total_cost += purchase_cost
            books.add(purchase['book'])
            num_books += purchase['quantity']
        data['total_cost'] = total_cost
        data['num_unique_books'] = len(books)
        data['num_books'] = round(num_books, 2)  # Remove inaccuracies from floating point multiplication
        return data