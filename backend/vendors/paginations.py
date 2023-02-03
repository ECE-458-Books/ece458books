from rest_framework import pagination

class VendorPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'