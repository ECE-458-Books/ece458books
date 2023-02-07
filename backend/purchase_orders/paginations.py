from rest_framework import pagination
from utils.paginations import HTTPSNoPortPagination


class PurchaseOrderPagination(HTTPSNoPortPagination):
    page_size = 3
    page_size_query_param = 'page_size'