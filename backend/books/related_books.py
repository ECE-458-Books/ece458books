import re
from urllib.request import urlopen
from typing import List, Dict
from lxml import etree
from isbnlib import *
from books.models import Book

from books.serializers import RelatedBookSerializer
from django.db.models import Q
from books.models import RelatedBookGroup


def standardize_title(title: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', title).lower()


def get_related_isbns(isbn: str) -> List[str]:
    related_books_endpoint = f"https://www.librarything.com/api/thingISBN/{isbn}"
    resp = urlopen(related_books_endpoint)
    tree = etree.parse(source=resp)
    related_isbns = {parse_isbn(xml_isbn.text) for xml_isbn in tree.getroot()}
    related_isbns.discard(isbn)  # Remove self from related isbns
    return related_isbns


def parse_isbn(isbn: str) -> str:
    return canonical(to_isbn13(isbn)) if is_isbn10(isbn) else canonical(isbn)


def _get_related_book_data(related_book_isbns: List[str]) -> List[Dict]:
    return RelatedBookSerializer(Book.objects.filter(related_book_group__in=Book.objects.filter(Q(isbn_13__in=related_book_isbns) | Q(isbn_10__in=related_book_isbns)).values('related_book_group')),
                                 many=True).data


def get_related_books_data(isbn: str) -> List[Dict]:
    return _get_related_book_data(get_related_isbns(isbn))


def combine_related_books_groups(related_book_group_ids: List[int]):
    related_books = Book.objects.filter(related_book_group__in=related_book_group_ids)  # Get all books that are in any related book groups
    # for sake of expected outcomes, let's use the related book group with the lowest id
    combined_related_book_group_id = min(related_book_group_ids)
    related_books.update(related_book_group=combined_related_book_group_id)
    related_book_ids_to_delete = related_book_group_ids.copy()
    related_book_ids_to_delete.remove(combined_related_book_group_id)
    _delete_related_books_groups(related_book_ids_to_delete)
    return combined_related_book_group_id


def _delete_related_books_groups(related_book_group_ids: List[int]):
    RelatedBookGroup.objects.filter(id__in=related_book_group_ids).delete()
