from rest_framework.parsers import BaseParser
from defusedxml import ElementTree as ET
from books.models import Book
from books.isbn import ISBNTools
from django.core.exceptions import ObjectDoesNotExist


class XMLParser(BaseParser):
    media_type = 'application/xml'
    isbn_tool = ISBNTools()

    def xml_sale_to_dict(self, sale_item):
        data = {}
        for property in sale_item:
            data[property.tag] = property.text
        return data

    def parse(self, stream, media_type=None, parser_context=None):
        parser = ET.DefusedXMLParser()
        tree = ET.parse(parser=parser, source=stream)
        root = tree.getroot()
        sales_record = {}
        sales_record['date'] = root.attrib['date']
        sales_record['sales'] = []
        for item in root:
            sale_data = self.xml_sale_to_dict(item)
            sale = {}

            # Check if valid ISBN
            # If not a valid ISBN, don't add to sales_record because discard line item
            if not self.isbn_tool.is_valid_isbn(sale_data['isbn']):
                continue

            # Check if ISBN in database
            # If not in databaase, don't add to sales_record because discard line item
            try:
                sale['book'] = Book.objects.filter(isbn_13=self.isbn_tool.parse_isbn(sale_data['isbn'])).get().id
            except ObjectDoesNotExist as odne:
                continue

            try:
                sale['quantity'] = int(sale_data['qty'])
            except ValueError:
                continue

            try:
                sale['unit_retail_price'] = float(sale_data['price'])
            except ValueError:
                continue

            sales_record['sales'].append(sale)
        return sales_record


"""
Format of XML:
<sale date="">
    <item>
        <isbn>0345409469</isbn>
        <qty>1</qty>
        <price>7.99</price>
    </item>
    <item>
        <isbn>978-0345376596</isbn>
        <qty>2</qty>
        <price>9.99</price>
    </item>
</sale>
"""