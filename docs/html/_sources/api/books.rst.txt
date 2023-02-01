Books API
==========

.. contents:: Table of contents
   :local:
   :backlinks: none
   :depth: 2

ISBN
-----

ISBN Search
~~~~~~~~~~~~

.. http:post:: /api/v1/books/isbns/
   
   Get a list of initial book data to populate on frontend

   :query string isbns: String of ISBNs separated by spaces and/or commas
   
   **Example request**

   .. tabs::

      .. code-tab:: bash

         curl --location --request POST 'https://books.colab.duke.edu:8000/api/v1/books/isbns/' \
         --form 'isbns="9780131103627, 978-0321928429, 978-3319110790, 1492052590"'

      .. code-tab:: python

         import requests

         url = "https://books.colab.duke.edu:8000/api/v1/books/isbns/"

         payload={'isbns': '9780131103627, 978-0321928429, 978-3319110790, 1492052590'}

         files=[

         ]

         headers = {}

         response = requests.request("POST", url, headers=headers, data=payload, files=files)

         print(response.text)

      .. code-tab:: nodejsrepl

         var axios = require('axios');
         var FormData = require('form-data');
         var data = new FormData();
         data.append('isbns', '9780131103627, 978-0321928429, 978-3319110790, 1492052590');

         var config = {
            method: 'post',
            url: 'https://books.colab.duke.edu:8000/api/v1/books/isbns/',
            headers: { 
               ...data.getHeaders()
            },
            data : data
         };

         axios(config)
         .then(function (response) {
            console.log(JSON.stringify(response.data));
         })
         .catch(function (error) {
            console.log(error);
         });



   **Example response**

   .. sourcecode:: json

      [
         {
            "title": "The C Programming Language",
            "authors": [
                  "Brian W. Kernighan",
                  "Dennis M. Ritchie"
            ],
            "publisher": "Prentice Hall",
            "pageCount": 272,
            "publishedDate": 1988,
            "isbn_10": "0131103709",
            "isbn_13": "9780131103627",
            "height": 9.84,
            "width": 7.24,
            "thickness": 0.94,
            "fromDB": true
         },
         {
            "title": "C Primer Plus",
            "authors": [
                  "Stephen Prata"
            ],
            "publisher": "Pearson Education",
            "pageCount": 1037,
            "publishedDate": 2014,
            "isbn_10": "0321928423",
            "isbn_13": "9780321928429",
            "height": 9.06,
            "width": 7.09,
            "thickness": 2.28,
            "fromDB": true
         },
         {
            "title": "Linear Algebra Done Right",
            "authors": [
                  "Sheldon Axler"
            ],
            "publisher": "Springer International Publishing",
            "pageCount": 340,
            "publishedDate": 2014,
            "isbn_10": "3319110799",
            "isbn_13": "9783319110790",
            "height": 9.84,
            "width": 6.1,
            "thickness": 0.79,
            "fromDB": false
         },
         {
            "title": "Programming Rust",
            "authors": [
                  "Jim Blandy",
                  "Jason Orendorff",
                  "Leonora Tindall"
            ],
            "publisher": "O'Reilly Media",
            "pageCount": 711,
            "publishedDate": 2021,
            "isbn_10": "1492052590",
            "isbn_13": "9781492052593",
            "height": 9.45,
            "width": 7.13,
            "thickness": 1.46,
            "fromDB": false
         }
      ]