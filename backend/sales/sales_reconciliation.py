class SalesReconciliationFieldsCalculator:

    @staticmethod
    def add_calculated_fields(data):
        total_revenue = 0
        books = set()
        num_books = 0
        for sale in data['sales']:
            sale_revenue = sale['quantity'] * sale['unit_retail_price']
            total_revenue += sale_revenue
            books.add(sale['book'])
            num_books += sale['quantity']
        data['total_revenue'] = total_revenue
        data['num_unique_books'] = len(books)
        data['num_books'] = num_books
        return data