from rest_framework.pagination import PageNumberPagination 
from rest_framework.utils.urls import remove_query_param, replace_query_param

class HTTPSNoPortPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

    def get_next_link(self):
        """Override get_next_link to support HTTPS and remove explicit port numbering

        Returns:
            next_link: "https://${server_name}/${request_uri}

        """
        if not self.page.has_next():
            return None
        url = self.request.build_absolute_uri()
        reformat_url = self.reformat_url(url)
        page_number = self.page.next_page_number()
        return replace_query_param(reformat_url, self.page_query_param, page_number)
    
    def get_previous_link(self):
        """Override get_previous_link to support HTTPS and remove explicit port numbering

        Returns:
            previous_link: "https://${server_name}/${request_uri}

        """
        if not self.page.has_previous():
            return None
        url = self.request.build_absolute_uri()
        reformat_url = self.reformat_url(url)
        page_number = self.page.previous_page_number()
        if page_number == 1:
            return remove_query_param(reformat_url, self.page_query_param)
        return replace_query_param(reformat_url, self.page_query_param, page_number)
    
    def reformat_url(self, url):
        reformat_url = url.replace("http://", "https://")
        port = self.get_port_number(reformat_url)

        reformat_url = reformat_url.replace(f":{port}", "")

        return reformat_url
    
    def get_port_number(self, url):
        if(len(url.split(":"))<2):
            return None
        return url.split(":")[2].split("/")[0]
