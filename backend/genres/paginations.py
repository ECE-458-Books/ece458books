from rest_framework import pagination
from utils.paginations import HTTPSNoPortPagination

class GenrePagination(HTTPSNoPortPagination):
    page_size = 10
    page_size_query_param = 'page_size'