from rest_framework.pagination import PageNumberPagination 
from rest_framework.utils.urls import remove_query_param, replace_query_param

from books.utils import reformat_uri_to_hostname

import os, environ

class HTTPSNoPortPagination(PageNumberPagination):
    """Custom Pagination Class that overrides the django PageNumberPagination
       
       The default get_next_link, get_previous_link returns the url with http and port number added

       This class is changing the header to HTTPS and remove explicit port numbering
    """
    page_size = 10
    page_size_query_param = 'page_size'
    env = environ.Env()
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
    host_name = env('HOST_NAME')

    def get_next_link(self):
        """Override get_next_link to support HTTPS and remove explicit port numbering

        Returns:
            next_link: "https://${server_name}/${request_uri}

        """
        if not self.page.has_next():
            return None
        uri = self.request.build_absolute_uri()
        reformat_url = reformat_uri_to_hostname(uri, self.host_name)
        page_number = self.page.next_page_number()
        return replace_query_param(reformat_url, self.page_query_param, page_number)
    
    def get_previous_link(self):
        """Override get_previous_link to support HTTPS and remove explicit port numbering

        Returns:
            previous_link: "https://${server_name}/${request_uri}

        """
        if not self.page.has_previous():
            return None
        uri = self.request.build_absolute_uri()
        reformat_url = reformat_uri_to_hostname(uri, self.host_name)
        page_number = self.page.previous_page_number()
        if page_number == 1:
            return remove_query_param(reformat_url, self.page_query_param)
        return replace_query_param(reformat_url, self.page_query_param, page_number)
    