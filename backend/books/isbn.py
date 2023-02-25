from urllib.request import urlopen
import json, os, io, environ, urllib
from isbnlib import *
from dateutil import parser
import PIL.Image as Image

from django.conf import settings

from .scpconnect import SCPTools
from .utils import uri_to_local_image_location

class ISBNTools:
    def __init__(
        self,
    ):
        env = environ.Env()
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

        self._base_url = env('EXTERNAL_BOOK_METADATA_API_ENDPOINT')
        self._image_base_url = env('EXTERNAL_BOOK_IMAGE_API_ENDPOINT')
        self._internal_image_base_url = env('INTERNAL_BOOK_IMAGE_API_ENDPOINT')
        self._default_image_name = env('DEFAULT_IMAGE_NAME')
        self._scp_toolbox = SCPTools()

    def is_valid_isbn(
        self,
        isbn: str,
    ):
        return is_isbn10(isbn) or is_isbn13(isbn)

    def fetch_isbn_data(
        self,
        isbn: str = None,
        uri: str = None,
    ):
        if not self.is_valid_isbn(isbn):
            return {"Invalid ISBN": isbn}

        parsed_isbn = self.parse_isbn(isbn)

        # get book metadata from Google Books API
        end_url = self._base_url + parsed_isbn 
        resp = urlopen(end_url)
        json_resp = json.load(resp)
        metadata = self.parse_response(json_resp, parsed_isbn)

        # get book image from openlibrary
        local_image_url = self.download_external_book_image_to_local(parsed_isbn, uri)
        
        metadata['image_url'] = local_image_url

        return metadata
    
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
    
    def download_default_book_image_to_local(self, uri):
        end_url = self._internal_image_base_url + '/' + self._default_image_name
        return self.get_book_local_image_url(end_url, 'default', uri)
    
    def download_existing_image_to_local(self, end_url, isbn_13, uri):
        local_image_location = uri_to_local_image_location(uri)

        # Do not fetch default.png from server
        if self._default_image_name in end_url:
            return local_image_location + self._default_image_name

        return self.get_book_local_image_url(end_url, isbn_13, uri)

    def download_external_book_image_to_local(self, isbn_13, uri):
        end_url = self._image_base_url + f'/{isbn_13}-L.jpg?default=false'
        return self.get_book_local_image_url(end_url, isbn_13, uri)
    
    
    def get_book_local_image_url(self, end_url, isbn_13, uri):
        """Return URL for local book image

        Args:
            isbn_13:

        Returns:
            str: Static URL to get book image
        """
        local_image_location = uri_to_local_image_location(uri)
        
        image_raw_bytes = self.get_image_raw_bytes(end_url, isbn_13)
        filename = f'{isbn_13}.jpg'
        _, filename = self.create_local_image(filename, image_raw_bytes)

        return local_image_location + filename

    def get_image_raw_bytes(self, end_url, isbn_13):
        """Return raw bytes of book image

        Args:
            end_url: API Endpoint
            isbn_13: List of raw isbns

        Returns:
            list: Byte array of book from OpenLibrary 
        """
        try:
            resp = urlopen(end_url)
        except Exception as e:
            # Case where defualt image does not exist
            return None
        
        image_bytes= resp.read()

        return image_bytes
    
    def create_local_image(self, filename, image_bytes):
        if image_bytes is None:
            return '', self._default_image_name

        absolute_location = f'{settings.STATICFILES_DIRS[0]}/{filename}'

        image = Image.open(io.BytesIO(image_bytes))
        image.save(absolute_location)

        return absolute_location, filename
    
    def commit_image_raw_bytes(self, request, book_id, isbn_13):
        # Get the image raw_bytes
        file_uploaded = request.FILES.get('image')
        content_type = file_uploaded.content_type
        extension = content_type.split('/')[-1].strip()
        file_bytes = file_uploaded.read()

        filename = f'{book_id}.{extension}'
        absolute_location, _ = self.create_local_image(filename, file_bytes)

        HOST = self._scp_toolbox.send_image_data(absolute_location)

        return f"https://{HOST}/{filename}"




