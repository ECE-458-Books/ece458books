from rest_framework import filters

class CustomSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        if self.str2bool(request.query_params.get('title_only')):
            return ['title']
        elif self.str2bool(request.query_params.get('author_only')):
            return ['authors__name']
        elif self.str2bool(request.query_params.get('publisher_only')):
            return ['publisher']
        elif self.str2bool(request.query_params.get('isbn_only')):
            return ['isbn_10', 'isbn_13']

        return super().get_search_fields(view, request)
    
    def str2bool(self, v):
        if v: return v.lower() in ("true", "1")
        return False