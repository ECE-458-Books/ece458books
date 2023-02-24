from urllib.request import urlopen
import urllib
import json, os
from isbnlib import *
from dateutil import parser

from .scpconnect import SCPTools

class ISBNTools:
    def __init__(
        self,
    ):
        self._base_url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"
        self._image_base_url = "https://covers.openlibrary.org/b/isbn"
        self._scp_toolbox = SCPTools()

    def is_valid_isbn(
        self,
        isbn: str,
    ):
        return is_isbn10(isbn) or is_isbn13(isbn)

    def fetch_isbn_data(
        self,
        isbn: str = None,
    ):
        if not self.is_valid_isbn(isbn):
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
        # This is the case where GoogleBooks gives us a item count of zero for that isbn
        if (response['totalItems'] == 0):
            return {"Invalid ISBN": isbn}

        ret = {}

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
        If the ISBN isn't valid we return the raw_isbn without formatting

        Args:
            isbn_list: List of raw isbns

        Returns:
            list: The parsed ISBN list formatted to ISBN13.

        """
        return [self.parse_isbn(raw_isbn) if self.is_valid_isbn(raw_isbn) else raw_isbn for raw_isbn in isbn_list]
    
    def get_image(self, isbn_13):
        end_url = self._image_base_url + f'/{isbn_13}-L.jpg?default=false'

        try:
            resp = urlopen(end_url)
        except Exception as e:
            # Case where defualt image does not exist
            host = self._scp_toolbox.get_host()
            return f"https://{host}/{DEFAULT_IMG}"

    
    def create_image(self, book_id, isbn_13):
        end_url = self._image_base_url + f'/{isbn_13}-L.jpg?default=false'

        DEFAULT_IMG = "media/books/default.png"

        try:
            resp = urlopen(end_url)
        except Exception as e:
            # Case where defualt image does not exist
            host = self._scp_toolbox.get_host()
            return f"https://{host}/{DEFAULT_IMG}"

        image_bytearray = resp.read()

        filename = f'{book_id}.jpg'
        location = f'/temp_media/{filename}'
        absolute_location = os.getcwd()+location

        HOST = self._scp_toolbox.send_image_data(image_bytearray, absolute_location)

        return f"https://{HOST}/{filename}"
