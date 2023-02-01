from urllib.request import urlopen
import json
from pprint import pprint
from isbnlib import *
from dateutil import parser

class ISBNTools:
    def __init__(
        self,
    ):
        self._base_url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"

    def fetch_isbn_data(
        self,
        isbn: str = None,
        ):
        if not (is_isbn10(isbn) or is_isbn13(isbn)):
            return {"Invalid ISBN": isbn}

        parsed_isbn = self.parse_isbn(isbn)

        end_url = self._base_url + parsed_isbn 
        resp = urlopen(end_url)
        json_resp = json.load(resp)

        return self.parse_response(json_resp, parsed_isbn)
    
    def parse_isbn(
        self,
        isbn: str = None,
    ):
        return canonical(to_isbn13(isbn)) if is_isbn10(isbn) else canonical(isbn)

    def parse_response(
        self,
        response: dict,
        isbn: str,
    ):
        ret = {}

        if (response['totalItems'] == 0):
            return ret
        selfLink = response['items'][0]['selfLink']

        # Google Books are represented differently and for more data need to make a second request
        j = json.load(urlopen(selfLink))
        info = j['volumeInfo']

        relevant_keys = ['title', 'authors', 'publisher', 'pageCount', 'publishedDate', 'industryIdentifiers', 'dimensions']

        for key in relevant_keys:
            if(key == 'dimensions'):
                # convert dimensions
                for dimension in info['dimensions'].keys():
                    ret[dimension] = self.centiToInches(info['dimensions'][dimension])
            elif (key == 'industryIdentifiers'):
                # convert to isbn
                ret['isbn_10'] = info[key][0]['identifier']
                ret['isbn_13'] = isbn
            elif (key == 'publishedDate'):
                ret[key] = parser.parse(info[key]).year
            else:
                ret[key] = info[key]
        
        # Set from DB to False
        ret["fromDB"] = False

        return ret

    def centiToInches(
        self, 
        centi: str
    ) -> float:
        """Convert Google Books cm to Inches

        Args:
            centi: string formated as {size} cm

        Returns:
            inch: Converted cm value to inches in float format

        *Note
            Google Books gives us the size in cm(str) thus, conversion is needed

        """

        # remove unit
        unit = 'cm'

        centi_reformatted = float(centi.replace(unit, "").strip())

        inch = '{0:.2f}'.format(centi_reformatted/2.54)
        return float(inch)

    def parse_raw_isbn_list(
        self, 
        isbn_list
    ):
        """Return parsed ISBN list 

        Args:
            isbn_list: List of raw isbns

        Returns:
            list: The parsed ISBN list formatted to ISBN13.

        """
        return [self.parse_isbn(raw_isbn) for raw_isbn in isbn_list]
