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

    :query sort: one of ``hit``, ``created-at``
    :query offset: offset number. default is 0
    :query limit: limit number. default is 30
   
    :requestheader Authorization: `token`
   
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