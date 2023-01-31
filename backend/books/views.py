from django.core import serializers
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
import re
from .isbn import ISBNSearch
from .serializers import BookSerializer
from .models import Book, Author, Genre
from pprint import pprint

class ISBNSearchView(APIView):
    search = ISBNSearch()

    def post(self, request):
        req_dict = request.data
        if "isbns" in req_dict:
            isbns = re.split("\s?[, ]\s?", req_dict['isbns'].strip())
        else:
            return Response({"details":"Please Include 'isbns' Field to JSON Request"}, status=status.HTTP_400_BAD_REQUEST)

        response_list = []

        for isbn in isbns:
            parsed_isbn = self.search.parse_isbn(isbn)
            query_set = Book.objects.filter(isbn_13=parsed_isbn)
            # If ISBN exist in DB get from DB
            if(len(query_set) == 0):
                response_list.append(self.search.fecth_isbn_data(isbn))
            else:
                # get if from DB
                response_list.append(self.parseDBBookModel(query_set[0]))

        return Response(response_list)
    
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
    serializer_class = BookSerializer
    queryset = Book.objects.all()
    # permissions_classes = [IsAdminUser, IsAuthenticated]
    permissions_classes = [AllowAny,]

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
    lookup_url_kwarg = 'isbn_13'
    permission_classes = [IsAuthenticated]