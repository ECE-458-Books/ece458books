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
        info = j['volumeInfo']
        pprint(info)

        relevant_keys = ['title', 'authors', 'publisher', 'pageCount', 'publishedDate', 'industryIdentifiers', 'dimensions']

        for key in relevant_keys:
            if(key == 'dimensions'):
                # convert dimensions
                for dimension in info['dimensions'].keys():
                    ret[dimension] = self.centiToInches(info['dimensions'][dimension])
            elif (key == 'industryIdentifiers'):
                # convert to isbn
                ret['isbn_10'] = info[key][0]['identifier']
                ret['isbn_13'] = info[key][1]['identifier']
            else:
                ret[key] = info[key]

        return ret

    def centiToInches(
        self, 
        centi
    ):
        # remove unit
        unit = 'cm'

        centi_reformatted = float(centi.replace(unit, "").strip())

        inch = '{0:.2f}'.format(centi_reformatted/2.54)
        return float(inch)

    
if __name__ == "__main__":
    search = ISBNSearch()
    isbn = "978-0131103627"
    pprint(search.fecth_isbn_data(isbn))