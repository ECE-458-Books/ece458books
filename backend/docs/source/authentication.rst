=============================
Authentication Documentation
=============================

------------------------------------------
Registering a User: `/api/v1/auth/users/`
------------------------------------------
#####################
**POST**
#####################

:Request Body:

::

    {
        "user-registration": {
            "email": "<youremail@example.com>",
            "username": "<username>",
            "password": "<password>"
        }
    }

:Response Body:

::

    {
    "user": {
        "email": "<youremail@example.com>",
        "username": "<username>",
        "token": "<token>"
        }
    }

------------------------------------------
Token Generation: `/api/v1/auth/token/`
------------------------------------------
#####################
**POST**
#####################

:Request Body:

::

    {
        "email": "<youremail@example.com>",
        "password": "<password>"
    }

:Response Body:

::

    {
        "refresh": "<refresh_token>",
        "access": "<access_token>"
    }


------------------------------------------
User Login: `/api/v1/auth/users/login/`
------------------------------------------
#####################
**POST**
#####################

:Request Body:

::

    {
        "user": {
            "email": "<youremail@example.com>",
            "password": "<password>"
        }
    }

:Response Body:

::

    {
    "user": {
        "email": "<youremail@example.com>",
        "username": "<username>",
        "token": "<token>"
        }
    }

------------------------------------------
User Information: `/api/v1/auth/user/`
------------------------------------------
#####################
**PUT**
#####################
:Purpose: Update user information

:Notes: Must send token in this request to authenticate the user.

:Request Body: The information to update. For example:

::

    {
        "user": {
            "username": "<new_username>"
        }
    }

:Response Body:

::

    {
    "user": {
        "email": "<youremail@example.com>",
        "username": "<username>",
        "token": "<token>"
        }
    }

#####################
**GET**
#####################

:Purpose: Retrieve user information

:Notes: Must send token in this request to authenticate the user.

:Request Body:

::

    {
        "user": {
            "email": "<youremail@example.com>",
            "password": "<password>"
        }
    }

:Response Body:

::

    {
    "user": {
        "email": "<youremail@example.com>",
        "username": "<username>",
        "token": "<token>"
        }
    }

------------------------------------------
Token Refresh: `/api/v1/auth/user/`
------------------------------------------

#####################
**PUT**
#####################

:Purpose: Get a new access token

:Request Body:

::

    {
        "refresh": "<refresh_token>"
    }

:Response Body:

::

    {
    "access": "<access_token"
    }
