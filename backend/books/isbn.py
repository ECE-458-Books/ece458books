from urllib.request import urlopen
import json, os, io, environ, urllib
from isbnlib import *
from dateutil import parser
import PIL.Image as Image

import threading

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
        self._host_name = env('HOST_NAME')
        self._internal_image_base_url = f'https://{self._host_name}{self._internal_book_image_url_path}'
    
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

        threads = list()
        metadata = dict()

        kwargs = {
            "isbn": parsed_isbn,
            "shared_dict": metadata
        }

        # get book metadata from Google Books API
        book_metadata_thread = threading.Thread(target=self.get_external_book_metadata, kwargs=kwargs, daemon=True)
        threads.append(book_metadata_thread)
        book_metadata_thread.start()

        # get book url from openlibrary
        image_metadata_thread = threading.Thread(target=self.get_external_book_image_url, kwargs=kwargs, daemon=True)
        threads.append(image_metadata_thread)
        image_metadata_thread.start()

        for thread in threads:
            thread.join()
        
        return metadata
    
    def get_external_book_metadata(
        self,
        isbn,
        shared_dict,
    ):
        end_url = self._base_url + isbn 
        try:
            resp = urlopen(end_url)
        except:
            # This is to catch the below error from GoogleBooks
            # urllib.error.HTTPError: HTTP Error 429: Too Many Requests
            # urllib will automatically retry the failed request
            pass

        json_resp = json.load(resp)
        data = self.parse_response(json_resp, isbn)
        shared_dict.update(data)

    def get_external_book_image_url(
        self, 
        isbn,
        shared_dict,
    ):
        end_url = self._image_base_url + f'/{isbn}-L.jpg?default=false'
        image_dict = dict()

        if self.get_image_raw_bytes(end_url) is None:
            image_dict['image_url'] = self.get_default_image_url()
        else:
            image_dict['image_url'] = end_url
        
        shared_dict.update(image_dict)
    
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
                    isbn_10 = canonical(info[key][0]['identifier'])
                    ret['isbn_10'] = isbn_10 if is_isbn10(isbn_10) else to_isbn10(isbn)
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

