import re, os

from django.db.models import OuterRef, Subquery

from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import BookListAddSerializer, BookSerializer, ISBNSerializer, BookImageSerializer
from .isbn import ISBNTools
from .models import Book, Author, BookImage
from .paginations import BookPagination
from .search_filters import CustomSearchFilter
from .scpconnect import SCPTools

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
    serializer_class = BookListAddSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = BookPagination
    filter_backends = [filters.OrderingFilter, CustomSearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']
    search_fields = ['authors__name', 'title', '=publisher', '=isbn_10', '=isbn_13']
    isbn_toolbox = ISBNTools()

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

        # Handle the isbn that is already in DB
        try:
            obj = Book.objects.get(isbn_13=request.data['isbn_13'])
        except Exception as e:
            obj = None

        # If the object with the specific isbn_13 is found we do the following:
        # 1. add the isGhost field to the request data
        # 2. update the already existing row in DB
        if obj is not None:
            request.data['isGhost'] = False
            serializer = self.get_serializer(obj, data=request.data, partial=False)
        else:
            # This is different from the above serializer because this is creating a new row in the table
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Get or Create the Image
        self.bookimage_get_and_create(serializer.data.get('isbn_13'))

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def bookimage_get_and_create(self, isbn_13):
        book = Book.objects.filter(isbn_13=isbn_13)

        # This creates an image in temp_media and sends a file
        url = self.isbn_toolbox.create_image(book[0].id, isbn_13)

        obj, created = BookImage.objects.get_or_create(
            book=book[0],
            url=url
        )

        # We need to patch the url if it is a get
        if obj is not None:
            obj.url = url
            obj.save()
    
    def getOrCreateModel(self, item_list, model):
        for item in item_list:
            obj, created = model.objects.get_or_create(
                name=item.strip(),
            )
    
    def get_queryset(self):
        default_query_set = Book.objects.filter(isGhost=False)
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

    def destroy(self, request, *args, **kwargs):

        # Check if the request url is valid
        try:
            instance = self.get_object()
        except Exception as e:
            return Response({"error": f"{e}"}, status=status.HTTP_204_NO_CONTENT)

        # At this point we know the book exists in DB

        # check if book can be destroyed by inventory count
        if instance.stock != 0:
            return Response({"error": f"Cannot delete book with title: {instance.title} and id: {instance.id} because its stock is {instance.stock}. Stock must be 0 to delete a book."})

        # If book can be destroyed, we just make the isGhost=True and do not delete in database
        partial = True
        data = {"isGhost": True}
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"status" : f"Book: {instance.title}(id:{instance.id}) is now a ghost"}, status=status.HTTP_204_NO_CONTENT)

class RetrieveUpdateBookImageAPIView(RetrieveUpdateAPIView):
    serializer_class = BookImageSerializer
    queryset = BookImage.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'book_id' # looks up using the book_id field
    lookup_url_kwarg = 'book_id'
    scp_toolbox = SCPTools()

    def update(self, request, *args, **kwargs):
        book_id = request.build_absolute_uri().split('/')[-1].strip()
        file_uploaded = request.FILES.get('image')
        content_type = file_uploaded.content_type
        extension = content_type.split('/')[-1].strip()
        file_bytes = file_uploaded.read()

        filename = f'{book_id}.{extension}'
        location = f'/temp_media/{filename}'
        absolute_location = os.getcwd()+location

        HOST = self.scp_toolbox.send_image_data(file_bytes, absolute_location)

        # Now update URL of BookImage
        instance = self.get_object()
        data = {
            "url" : f"https://{HOST}/{filename}"
        }
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response('If no errors occurred, should work. If not, slack Hosung')