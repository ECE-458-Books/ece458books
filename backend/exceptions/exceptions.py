from rest_framework.exceptions import APIException


class BookNotInInventoryException(APIException):
    status_code = 404
    default_detail = "Please Add Book title: {0} and id: {1} to the books inventory before {2} for it."
    default_code = "book_not_found"

    def __init__(self, title: str, id: int, attempted_action: str):
        self.default_detail = self.default_detail.format(title, id, attempted_action)
        super().__init__()


class NegativeBookStockException(APIException):
    status_code = 403
    default_detail = "Cannot perform {0} because doing so would cause a book's stock to become negative."
    default_code = "negative_book_stock"

    def __init__(self, attempted_action: str):
        self.default_detail = self.default_detail.format(attempted_action)
        super().__init__()


class NoPurchaseInPurchaseOrderException(APIException):
    status_code = 404
    default_detail = "There must be at least one purchase in a purchase order."
    default_code = "purchase_not_found"
