from rest_framework import filters

from .utils import str2bool

class CustomSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        if str2bool(request.query_params.get('title_only')):
            return ['title']
        elif str2bool(request.query_params.get('author_only')):
            return ['authors__name']
        elif str2bool(request.query_params.get('isbn_only')):
            return ['isbn_10', 'isbn_13']
        elif str2bool(request.query_params.get('publisher_only')):
            return ['publisher']

        return super().get_search_fields(view, request)
    
def generate_filter_from_query_params(query_params):
    filter_kwargs = {
        "isGhost": False
    }

    if genre := query_params.get('genre', False):
        filter_kwargs['genres__name'] = genre

    search = query_params.get('search')

    if str2bool(query_params.get('title_only', False)):
        filter_kwargs['title__icontains'] = search
    elif str2bool(query_params.get('author_only', False)):
        filter_kwargs['authors__name__icontains'] = search
    elif str2bool(query_params.get('isbn_only', False)):
        filter_kwargs['isbn_13__icontains'] = search
    elif str2bool(query_params.get('publisher_only', False)):
        filter_kwargs['publisher__icontains'] = search
    
    return filter_kwargs