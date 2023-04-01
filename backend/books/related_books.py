import re
from urllib.request import urlopen
import json, os, io, environ, urllib
from typing import List
from lxml import etree
from isbnlib import *


def standardize_title(title: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', title).lower()


def get_related_isbns(isbn: str) -> List[str]:
    related_books_endpoint = f"https://www.librarything.com/api/thingISBN/{isbn}"
    resp = urlopen(related_books_endpoint)
    tree = etree.parse(source=resp)
    return {parse_isbn(xml_isbn.text) for xml_isbn in tree.getroot()}


def parse_isbn(isbn: str) -> str:
    return canonical(to_isbn13(isbn)) if is_isbn10(isbn) else canonical(isbn)
