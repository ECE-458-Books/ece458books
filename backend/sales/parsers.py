from rest_framework.parsers import BaseParser
from books.models import Book
from books.isbn import ISBNTools
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from lxml import etree


class XMLParser(BaseParser):
    media_type = 'application/xml'
    isbn_tool = ISBNTools()

    def xml_sale_to_dict(self, sale_item):
        data = {}
        for property in sale_item:
            data[property.tag] = property.text
        return data

    def parse(self, stream, media_type=None, parser_context=None):
        try:
            tree = etree.parse(source=stream)
        except Exception as e:
            raise serializers.ValidationError(e)

        # check structure
        with open("sales/xmlschema.xsd") as f:
            xmlschema_doc = etree.parse(f)
        xmlschema = etree.XMLSchema(xmlschema_doc)
        try:
            xmlschema.assertValid(tree)
        except Exception as e:
            raise serializers.ValidationError(e)
        # if not xmlschema.validate(tree):
        #     raise serializers.ValidationError("")

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
        # Handle no valid sales in record
        if len(sales_record['sales']) == 0:
            raise serializers.ValidationError("No valid sales, sales record not added.")
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