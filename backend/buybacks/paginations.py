from utils.paginations import HTTPSNoPortPagination


class BuybackPagination(HTTPSNoPortPagination):
    page_size = 10
    page_size_query_param = 'page_size'