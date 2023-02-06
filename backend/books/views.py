import re

from django.db.models import OuterRef, Subquery

from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import BookAddSerializer, BookSerializer, ISBNSerializer
from .isbn import ISBNTools
from .models import Book, Author
from .paginations import BookPagination
from .search_filters import CustomSearchFilter

from genres.models import Genre

class ISBNSearchView(APIView):
    """
    View to Search ISBNs using internal DB or External DB such as Google Books

    * Input data is a string of ISBNs separated by spaces and/or commas
    """
    permission_classes = [IsAuthenticated]
    isbn_toolbox = ISBNTools()

    def post(self, request):
        serializer = ISBNSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Split ISBN with spaces and/or commas
        raw_isbn_list = re.split("\s?[, ]\s?", serializer.data['isbns'].strip())
        # Convert all ISBN to ISBN-13
        parsed_isbn_list = self.isbn_toolbox.parse_raw_isbn_list(raw_isbn_list)

        data_populated_isbns = {
            "books": [],
            "invalid_isbns": [],
        }

        # Fetch from DB if exist or else get from External DB such as Google Books
        for isbn in parsed_isbn_list:
            query_set = Book.objects.filter(isbn_13=isbn)

            # If ISBN exist in DB get from DB
            if(len(query_set) == 0):
                # Get book data from external source
                external_data = self.isbn_toolbox.fetch_isbn_data(isbn)
                if "Invalid ISBN" in external_data:
                    data_populated_isbns['invalid_isbns'].append(isbn)
                else:
                    data_populated_isbns['books'].append(external_data)
            else:
                # get book data from DB
                data_populated_isbns['books'].append(self.parseDBBookModel(query_set[0]))

        return Response(data_populated_isbns)
    
    def parseDBBookModel(self, book):
        # Returns a parsed Book json from Book Model
        ret = dict()

        for field in book._meta.fields:
            ret[field.name] = getattr(book, field.name)

        # Deal with many-to-many fields
        # Get Authors
        for author in book.authors.all():
            ret.setdefault("authors", []).append(author.name)

        # Get Genres
        for genre in book.genres.all():
            ret.setdefault("genres", []).append(genre.name)

        ret["fromDB"] = True

        return ret


class ListCreateBookAPIView(ListCreateAPIView):
    serializer_class = BookAddSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = BookPagination
    filter_backends = [filters.OrderingFilter, CustomSearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']
    search_fields = ['authors__name', 'title', '=publisher', '=isbn_10', '=isbn_13']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    # Override default create method
    def create(self, request, *args, **kwargs):
        # Need to handle creating authors and genres if not present in DB
        self.getOrCreateModel(request.data['authors'], Author)
        self.getOrCreateModel(request.data['genres'], Genre)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def getOrCreateModel(self, item_list, model):
        for item in item_list:
            obj, created = model.objects.get_or_create(
                name=item.strip(),
            )
    
    def get_queryset(self):
        default_query_set = Book.objects.all()
        # Books have a ManyToMany relationship with Author & Genre
        # A book can have many authors and genres.
        # We need to define sorting behavior for these fields
        # Annotating creates a single field where we can order the Books by one of the
        # elements in the ManyToMany relationship
        default_query_set = default_query_set.annotate(
            # We create a subquery for getting a query_set of authors which are related to the book in question
            author=Subquery(
                Author.objects.filter(
                    # We filter the authors by the primary key of the book
                    book=OuterRef('pk')
                # Here we order by the name in ascending order and get the first author from the list
                ).order_by('name').values('name')[:1] # [:1] is used to avoid index out of bounds error when the filter returns an empty list
            )
        )
        
        default_query_set = default_query_set.annotate(
            genre=Subquery(
                Genre.objects.filter(
                    book=OuterRef('pk')
                ).order_by('name').values('name')[:1]
            )
        )

        # Filter for a specific genre
        # If a genre exists, the default query_set needs to be filtered by that specific genre
        if genre := self.request.query_params.get('genre'):
            # The requirements for Evolution 1 requires filtering by genre.
            # Thus if a query key 'genre' exists, we only consider the query_set having that specific genre
            return default_query_set.filter(genres__name=genre)

        return default_query_set

class RetrieveUpdateDestroyBookAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer 
    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'id'
