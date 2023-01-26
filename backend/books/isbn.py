from urllib.request import urlopen
import json
from pprint import pprint
from isbnlib import *

class ISBNSearch:
    def __init__(
        self,
    ):
        self._base_url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"

    def fecth_isbn_data(
        self,
        isbn: str = None,
        ):
        if not (is_isbn10(isbn) or is_isbn13(isbn)):
            return {"Invalid ISBN": isbn}

        parsed_isbn = self.parse_isbn(isbn)

        end_url = self._base_url + parsed_isbn 
        resp = urlopen(end_url)
        json_resp = json.load(resp)

        return self.parse_response(json_resp)
    
    def parse_isbn(
        self,
        isbn: str = None,
    ):
        return canonical(isbn)

    def parse_response(
        self,
        response: dict = {},
    ):
        ret = {}

        if (response['totalItems'] == 0):
            return ret
        selfLink = response['items'][0]['selfLink']
        j = json.load(urlopen(selfLink))

        relevant_keys = ['title', 'authors', 'pageCount', 'publishedDate', 'industryIdentifiers', 'dimensions']

        for key in relevant_keys:
            ret[key] = j['volumeInfo'][key]

        return ret
    
if __name__ == "__main__":
    search = ISBNSearch()
    isbn = "978-0131103627"
    pprint(search.fecth_isbn_data(isbn))