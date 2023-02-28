class BookSwitch:
    def header(self, book, header):
        self.book = book
        default = header
        return getattr(self, 'case_' + str(header), lambda: default)()

    def case_title(self):
        return self.book.__getattribute__('title')

    def case_authors(self):
        return '|'.join([author.name for author in self.book.authors.all()])

    def case_isbn_13(self):
        return self.book.__getattribute__('isbn_13')

    def case_isbn_10(self):
        return self.book.__getattribute__('isbn_10')

    def case_publisher(self):
        return self.book.__getattribute__('publisher')

    def case_publication_year(self):
        return self.book.__getattribute__('publishedDate')

    def case_page_count(self):
        return self.book.__getattribute__('pageCount')

    def case_height(self):
        try:
            v = self.book.__getattribute__('height')
        except AttributeError:
            v = ''
        return v


    def case_width(self):
        try:
            v = self.book.__getattribute__('width')
        except AttributeError:
            v = ''
        return v

    def case_thickness(self):
        try:
            v = self.book.__getattribute__('thickness')
        except AttributeError:
            v = ''
        return v

    def case_retail_price(self):
        return self.book.__getattribute__('retail_price')
    
    def case_genre(self):
        return '|'.join([genre.name for genre in self.book.genres.all()])

    def case_inventory_count(self):
        return self.book.__getattribute__('stock')