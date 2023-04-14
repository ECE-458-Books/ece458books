class BookSwitch:
    def header(self, book: dict, header):
        self.book = book
        default = self.book.get(header, None)
        return getattr(self, 'case_' + str(header), lambda: default)()

    def case_title(self):
        return self.book.get('title')

    def case_authors(self):
        return '|'.join([author for author in self.book.get('authors')])

    def case_isbn_13(self):
        return self.book.get('isbn_13')

    def case_isbn_10(self):
        return self.book.get('isbn_10', '')

    def case_publisher(self):
        return self.book.get('publisher')

    def case_publication_year(self):
        return self.book.get('publishedDate')

    def case_page_count(self):
        return self.book.get('pageCount', '')

    def case_height(self):
        return self.book.get('height', '')

    def case_width(self):
        return self.book.get('width', '')

    def case_thickness(self):
        return self.book.get('thickness', '')

    def case_retail_price(self):
        return self.book.get('retail_price')
    
    def case_genre(self):
        return '|'.join([genre for genre in self.book.get('genres')])

    def case_inventory_count(self):
        return self.book.get('stock')
    
    def case_shelf_space_inches(self):
        return self.book.get('shelf_space')

    def case_last_month_sales(self):
        return self.book.get('last_month_sales')

    def case_days_of_supply(self):
        return self.book.get('days_of_supply')

    def case_best_buyback_price(self):
        return self.book.get('best_buyback_price', 0)

    def case_num_related_books(self):
        return self.book.get('num_related_books')
