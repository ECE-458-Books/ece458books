import json
import random
from pprint import pprint

from django.urls import reverse

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.test import force_authenticate

from .tests_data import isbns, genres, retail_prices
from authapp.models import User
from books.models import Book, Author
from genres.models import Genre

BASE_URL = '/api/v1/books'

class BookTests(APITestCase):
    def setUpTestData():
        """setUpTestData() is called once at the beginning of the test run 
        for class-level setup. You'd use this to create objects that aren't 
        going to be modified or changed in any of the test methods.

        """
        pass

    def setUp(self):
        """setUp() is called before every test function to set up any objects 
        that may be modified by the test (every test function will get a "fresh" version of these objects).

        """
        self.book_cnt_total = 0
        self.factory = APIRequestFactory()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='testuser@test.com', password='top_secret'
        )
        self.client.force_authenticate(self.user)

        self.setUp_book_list_data()
        self.setUp_book_db()
    
    def setUp_book_list_data(self):
        csv_isbns = ",".join(isbns)
        data = {"isbns": csv_isbns}
        response = self.client.post(f'{BASE_URL}/isbns', data)
        d = json.loads(response.content.decode('utf-8'))
        self.books = d.get('books', None)
    
    def setUp_book_db(self):
        for book in self.books:
            book['genres'] = [random.choice(genres)]
            book['retail_price'] = [random.choice(retail_prices)]

            self.getOrCreateModel(book['authors'], Author)
            self.getOrCreateModel(book['genres'], Genre)

            response = self.client.post(f'{BASE_URL}/add', book)
            self.assertEqual(response.status_code, 201)
            self.book_cnt_total += 1

    def getOrCreateModel(self, item_list, model):
        if item_list is None: return
        
        for item in item_list:
            obj, created = model.objects.get_or_create(
                name=item.strip(),
            )

    
    def test_get_book_list(self):
        response = self.client.get(f'{BASE_URL}')
        self.assertEqual(response.status_code, 200)

        book_list_data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(book_list_data.get('count'), self.book_cnt_total) 