Authentication and Authorization
================================

.. contents:: Table of contents
   :local:
   :backlinks: none
   :depth: 2

User Registration and Login
----------------------------

User Registration
~~~~~~~~~~~~~~~~~~
.. http:post:: /api/v1/auth/users/register/

    Register a new user to the BookStore User DB.

    :query string email: email of registering user
    :query string username: username of registering user
    :query string password: password of registering user
   
    **Example request**

        .. tabs::

            .. code-tab:: bash

                $ curl --location --request POST 'https://books.colab.duke.edu:8000/api/v1/auth/users/register/' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "email": "<email>",
                    "username": "<username>",
                    "password": "<password>"
                }'

            .. code-tab:: python

                import requests
                import json

                url = "https://books.colab.duke.edu:8000/api/v1/auth/users/register/"

                payload = json.dumps({
                    "email": "<email>", 
                    "username": "<username>", 
                    "password": "<password>"
                })
                
                headers = {
                'Content-Type': 'application/json'
                }

                response = requests.request("POST", url, headers=headers, data=payload)

                print(response.text)

    **Example response**

    .. sourcecode:: json

        {
            "email": "<email>",
            "username": "<username>"
        }