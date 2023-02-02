from rest_framework import pagination

class BookPagination(pagination.PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'