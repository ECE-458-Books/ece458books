from rest_framework.exceptions import APIException

class NoRefreshTokenWhenLoggingOut(APIException):
    status_code = 400

    def __init__(self, msg):
        default_detail = f"KeyError: {msg} missing in request body"
        super().__init__(detail=default_detail, code=self.status_code)

class ModifyUserError(APIException):
    status_code = 400

    def __init__(self, msg):
        default_detail = f"Error: {msg}"
        super().__init__(detail=default_detail, code=self.status_code)
