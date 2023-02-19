class MissingHeadersException(Exception):

    def __init__(self, missing_headers) -> None:
        self.missing_headers = missing_headers
        super().__init__()


class ExtraHeadersException(Exception):

    def __init__(self, extra_headers) -> None:
        self.extra_headers = extra_headers
        super().__init__()


class InvalidISBN13LengthException(Exception):

    def __str__(self) -> str:
        return "invalid_isbn_13_length"


class NotInDbException(Exception):

    def __init__(self) -> None:
        self.message = "not_in_db"
        super().__init__(self.message)


class InsufficientStockException(Exception):

    def __init__(self, stock: int) -> None:
        self.message = f"insufficient_stock_{stock}"
        super().__init__(self.message)


class NotAnIntegerException(Exception):

    def __init__(self) -> None:
        self.message = "not_an_int"
        super().__init__(self.message)


class NotANumberException(Exception):

    def __init__(self) -> None:
        self.message = "not_a_number"
        super().__init__(self.message)


class NegativeValueException(Exception):

    def __init__(self, *args: object) -> None:
        self.message = "negative"
        super().__init__(self.message)
