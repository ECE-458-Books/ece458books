from rest_framework import pagination
from utils.paginations import HTTPSNoPortPagination


class SalesReconciliationPagination(HTTPSNoPortPagination):
    page_size = 10
    page_size_query_param = 'page_size'