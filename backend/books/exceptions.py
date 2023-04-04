from rest_framework.exceptions import APIException

class BookNonExistantException(APIException):
    status_code = 400

    def __init__(self, msg):
        default_detail = f"KeyError: Book ({msg}) is non-existant in DB. Please add the book before making corrections"
        super().__init__(detail=default_detail, code=self.status_code)


class InventoryAdjustmentNonIntegerException(APIException):
    status_code = 400

    def __init__(self, msg):
        default_detail = f"NonIntegerError: Adjustment ({msg}) is not a valid integer"
        super().__init__(detail=default_detail, code=self.status_code)


class InventoryAdjustmentBelowZeroException(APIException):
    status_code = 400

    def __init__(self, msg, stock):
        default_detail = f"BelowZeroError: Adjustment ({msg}) results in stock below zero. Current inventory count is {stock}"
        super().__init__(detail=default_detail, code=self.status_code)

class InventoryCountUnMatchedException(APIException):
    status_code = 400

    def __init__(self, book_name, running_stock, db_stock):
        default_detail = f"InventoryCountUnMatchedError: Book ({book_name}) DB stock ({db_stock}) is inconsistent with running stock ({running_stock})"
        super().__init__(detail=default_detail, code=self.status_code)