from rest_framework import pagination
from utils.paginations import CustomPagination


class SalesReconciliationPagination(CustomPagination):
    page_size = 10
    page_size_query_param = 'page_size'