from utils.paginations import HTTPSNoPortPagination


class BookcasePagination(HTTPSNoPortPagination):
    page_size = 10
    page_size_query_param = 'page_size'