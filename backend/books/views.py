import re

from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .serializers import BookAddSerializer, BookSerializer, ISBNSerializer
from .isbn import ISBNTools
from .models import Book, Author, Genre
from .paginations import BookPagination

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

        data_populated_isbn_list = []

        # Fetch from DB if exist or else get from External DB such as Google Books
        for isbn in parsed_isbn_list:
            query_set = Book.objects.filter(isbn_13=isbn)

            # If ISBN exist in DB get from DB
            if(len(query_set) == 0):
                # Get book data from external source
                data_populated_isbn_list.append(self.isbn_toolbox.fetch_isbn_data(isbn))
            else:
                # get book data from DB
                data_populated_isbn_list.append(self.parseDBBookModel(query_set[0]))

        return Response(data_populated_isbn_list)
    
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
    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = BookPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    # ordering_fields = ['title', 'authors', 'isbn_13', 'isbn_10', 'retail_price', 'genres', 'publisher', 'publishedDate', 'pageCount', 'width', 'height', 'thickness']
    ordering_fields = '__all__'
    ordering = ['id']
    search_fields = ['authors__name', 'title', '=publisher', '=isbn_10', '=isbn_13']


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

class RetrieveUpdateDestroyBookAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer 
    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'id'
