from rest_framework import filters

class CustomSearchFilter(filters.SearchFilter):
    def get_search_fields(self, view, request):
        if request.query_params.get('title_only'):
            return ['title']
        elif request.query_params.get('author_only'):
            return ['authors__name']
        elif request.query_params.get('publisher_only'):
            return ['publisher']
        elif request.query_params.get('isbn_only'):
            return ['isbn_10', 'isbn_13']

        return super().get_search_fields(view, request)