from urllib.request import urlopen
import json, os, io, environ, urllib
from isbnlib import *
from dateutil import parser
import PIL.Image as Image

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
        self._internal_book_image_absolute_path = env('INTERNAL_BOOK_IMAGE_ABSOLUTE_PATH')
        self._internal_book_image_url_path = env('INTERNAL_BOOK_IMAGE_URL_PATH')
        self._default_image_name = env('DEFAULT_IMAGE_NAME')
    
    def set_internal_image_base_url(self, uri):
        self._internal_image_base_url = uri_to_local_image_location(uri, self._internal_book_image_url_path)

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

        # get book url from openlibrary
        external_image_url = self.get_external_book_image_url(parsed_isbn)
        
        metadata['image_url'] = external_image_url

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
            if key in info.keys():
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

        if self.get_image_raw_bytes(end_url) is None:
            return self.get_default_image_url()

        return end_url
        # return self.get_book_local_image_url(end_url, isbn_13, uri)

    def get_external_book_image_url(self, isbn_13):
        end_url = self._image_base_url + f'/{isbn_13}-L.jpg?default=false'

        if self.get_image_raw_bytes(end_url) is None:
            return self.get_default_image_url()

        return end_url
    
    def get_book_local_image_url(self, end_url, isbn_13, uri):
        """Return URL for local book image

        Args:
            isbn_13:

        Returns:
            str: Static URL to get book image
        """
        local_image_location = uri_to_local_image_location(uri)
        
        image_raw_bytes = self.get_image_raw_bytes(end_url)
        _, filename = self.create_local_image(isbn_13, image_raw_bytes)

        return local_image_location + filename

    def get_image_raw_bytes(self, end_url):
        """Return raw bytes of book image

        Args:
            end_url: API Endpoint

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
    
    def create_local_image(self, filename_without_extension, image_bytes):
        if image_bytes is None:
            return '', self._default_image_name

        try:
            image = Image.open(io.BytesIO(image_bytes))
            filename = f'{filename_without_extension}.{image.format.lower()}'
            absolute_location = f'{self._internal_book_image_absolute_path}/{filename}'
            image.save(absolute_location)
        except Exception as e:
            # This means that the image_bytes is corrupted revert to default image in this case
            filename = self._default_image_name
            absolute_location = ''

        return absolute_location, filename # Absolute location is used to send the static file to image server

    def commit_image_url(self, request, book_id, isbn_13):
        # Get the image url
        end_url = request.data.get('image_url')

        # If the url is the default iamge url no need to download
        if end_url == self.get_default_image_url():
            return self.get_default_image_url()
        
        image_bytes = self.get_image_raw_bytes(end_url)
        filename_without_extension = f'{book_id}'
        abs_location, filename = self.create_local_image(filename_without_extension, image_bytes)

        return f"{self._internal_image_base_url}/{filename}"

    
    def commit_image_raw_bytes(self, request, book_id, isbn_13):
        # Get the image raw_bytes
        file_uploaded = request.data.get('image_bytes')
        content_type = file_uploaded.content_type
        extension = content_type.split('/')[-1].strip()
        file_bytes = file_uploaded.read()

        filename_without_extension = f'{book_id}'
        absolute_location, filename = self.create_local_image(filename_without_extension, file_bytes)

        return f"{self._internal_image_base_url}/{filename}"
        
    def get_default_image_url(self,):
        return f'{self._internal_image_base_url}/{self._default_image_name}'

