from rest_framework.exceptions import APIException


class BookNotInInventoryException(APIException):
    status_code = 404
    default_detail = "Please Add Book title: {0} and id: {1} to the books inventory before creating purchase orders for it."
    default_code = 'book_not_found'

    def __init__(self, title: str, id: int):
        self.default_detail = self.default_detail.format(title, id)
