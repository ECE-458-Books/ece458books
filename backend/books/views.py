import re, datetime

from django.conf import settings
from django.db import models
from django.db.models import OuterRef, Subquery, F, Case, When, Value, Sum, Func, Q, ExpressionWrapper, FloatField
from django.db.models.functions import Coalesce, Cast, Round

from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import BookListAddSerializer, BookSerializer, ISBNSerializer, BookImageSerializer
from .isbn import ISBNTools
from .models import Book, Author, BookImage
from .paginations import BookPagination
from .search_filters import *
from .scpconnect import SCPTools
from .utils import delete_all_files_in_folder_location, str2bool

from genres.models import Genre
from purchase_orders.models import Purchase
from sales.models import Sale
from buybacks.models import Buyback
from helpers.csv_writer import CSVWriter


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

        # Split ISBN with newlines, tabs, spaces and/or commas
        raw_isbn_list = re.split("\s?[, \t\n]\s?", serializer.data['isbns'].strip())

        # Delete all empty strings
        raw_isbn_list = [raw_isbn for raw_isbn in raw_isbn_list if raw_isbn != '']

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
            if (len(query_set) == 0):
                # Get book data from external source
                external_data = self.isbn_toolbox.fetch_isbn_data(isbn)
                if "Invalid ISBN" in external_data:
                    data_populated_isbns['invalid_isbns'].append(isbn)
                else:
                    data_populated_isbns['books'].append(external_data)
            else:
                if query_set[0].isGhost:
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
            if (v := getattr(book, field.name)) is not None:
                ret[field.name] = v

        # Deal with many-to-many fields
        # Get Authors
        for author in book.authors.all():
            ret.setdefault("authors", []).append(author.name)

        # Get Genres
        for genre in book.genres.all():
            ret.setdefault("genres", []).append(genre.name)

        # At this point there should be a BookImage associated with the book
        images = BookImage.objects.filter(book=book)

        if len(images) == 0:
            # This is the case where there is no default image associated with the book.
            local_url = self.isbn_toolbox.get_default_image_url()
        else:
            local_url = images[0].image_url

        ret["image_url"] = local_url
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

    def preprocess_multipart_form_data(self, request):
        data = request.data.dict()

        # handle authors, genres
        data['authors'] = [author.strip() for author in data['authors'].split(',')]
        data['genres'] = [genre.strip() for genre in data['genres'].split(',')]

        return data

    # Override default create method
    def create(self, request, *args, **kwargs):
        data = request.data
        content_type = request.content_type.split(';')[0]

        if content_type == 'multipart/form-data':
            # Preprocess Request when the content-type is not application/json but multipart/form-data
            data = self.preprocess_multipart_form_data(request)

        # if the dimension of a book is zero convert it to None
        data = self.convert_zero_to_null(data)

        # Need to handle creating authors and genres if not present in DB
        self.getOrCreateModel(data['authors'], Author)
        self.getOrCreateModel(data['genres'], Genre)

        # Handle the isbn that is already in DB
        try:
            obj = Book.objects.get(isbn_13=data['isbn_13'])
        except Exception as e:
            obj = None

        # If the object with the specific isbn_13 is found we do the following:
        # 1. add the isGhost field to the request data
        # 2. update the already existing row in DB
        if obj is not None:
            data['isGhost'] = False
            serializer = self.get_serializer(obj, data=data, partial=False)
        else:
            # This is different from the above serializer because this is creating a new row in the table
            serializer = self.get_serializer(data=data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        res = serializer.data

        setDefaultImage = str2bool(data.get('setDefaultImage'))

        # Get and Create the Image
        url = self.bookimage_get_and_create(request, res.get('isbn_13'), setDefaultImage)
        res['image_url'] = url

        headers = self.get_success_headers(serializer.data)
        return Response(res, status=status.HTTP_201_CREATED, headers=headers)

    def convert_zero_to_null(self, data):
        possible_zero_fields = ['pageCount', 'width', 'height', 'thickness']
        for possible_zero_field in possible_zero_fields:
            v = data.get(possible_zero_field, None)
            if v == '0' or v == 0:
                data[possible_zero_field] = None

        return data
    
    def has_image_bytes(self, request):
        return request.FILES.get('image_bytes', None) is not None

    def has_image_url(self, request):
        return request.data.get('image_url', None) is not None

    def bookimage_get_and_create(self, request, isbn_13, setDefaultImage):
        book = Book.objects.filter(isbn_13=isbn_13)

        # This creates an image in static and sends a file
        if setDefaultImage:
            url = self.isbn_toolbox.get_default_image_url()
        elif self.has_image_bytes(request):
            url = self.isbn_toolbox.commit_image_raw_bytes(request, book[0].id, isbn_13)
        elif self.has_image_url(request):
            url = self.isbn_toolbox.commit_image_url(request, book[0].id, isbn_13)
        else:
            url = self.isbn_toolbox.get_default_image_url()


        obj, created = BookImage.objects.get_or_create(
            book_id=book[0].id,
            defaults={'image_url': url},
        )

        # We need to patch the url if it is a get
        if not created:
            obj.image_url = url
            obj.save()

        return url

    def getOrCreateModel(self, item_list, model):
        if isinstance(item_list, str):
            item_list = item_list.split(',')

        for item in item_list:
            obj, created = model.objects.get_or_create(name=item.strip(),)

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
                ).order_by('name').values('name')[:1]  # [:1] is used to avoid index out of bounds error when the filter returns an empty list
            ))

        default_query_set = default_query_set.annotate(genre=Subquery(Genre.objects.filter(book=OuterRef('pk')).order_by('name').values('name')[:1]))

        # Filter for a specific genre
        # If a genre exists, the default query_set needs to be filtered by that specific genre
        if genre := self.request.query_params.get('genre'):
            # The requirements for Evolution 1 requires filtering by genre.
            # Thus if a query key 'genre' exists, we only consider the query_set having that specific genre
            return default_query_set.filter(genres__name=genre)

        # Search for books that a specific vendor has sold
        vendor = self.request.GET.get('vendor')
        if vendor is not None:
            default_query_set = default_query_set.filter(id__in=Purchase.objects.all().annotate(vendor_id=F('purchase_order__vendor')).filter(vendor_id=vendor).values('book')).distinct()

        # Support Sorting by best_buyback_price, last_month_sales, shelf_space, days_of_supply
        # The rationale for replicating the filter in the serializer is that it is the most efficient way to support sorting is using DRF's sorting filter
        # default_query_set = self.annotate_best_buyback_price(default_query_set)
        default_query_set = self.annotate_last_month_sales(default_query_set)
        default_query_set = self.annotate_shelf_space(default_query_set)
        default_query_set = self.annotate_days_of_supply(default_query_set)

        return default_query_set

    def annotate_best_buyback_price(self, query_set):
        pass
        # subquery = Purchase.objects.filter(book=107).annotate(vendor_id=F('purchase_order__vendor'))
        # subquery = Purchase.objects.filter(book=OuterRef('pk')).annotate(vendor_id=F('purchase_order__vendor'))
        
        # subquery = subquery.annotate(buyback_rate=Case(When(purchase_order__vendor__buyback_rate__isnull=False, then=F('purchase_order__vendor__buyback_rate')), default=Value(0)))

        # subquery = subquery.order_by('vendor_id', '-purchase_order__date').distinct('vendor_id')

        # results_pk = list(subquery.values_list(flat=True))

        # query_set = query_set.alias(
        #     testing=subquery
        # )

        # subquery2 = Purchase.objects.filter(book=OuterRef('pk'), pk__in=results_pk)
        # subquery = subquery.order_by('vendor_id', '-purchase_order__date')

        # subquery = subquery.values('buyback_rate', 'unit_wholesale_price', 'vendor_id')

        # subquery = subquery.annotate(buyback_price=ExpressionWrapper(Round(F('buyback_rate') * F('unit_wholesale_price') * .01, precision=2), output_field=FloatField())).order_by('-buyback_price').values('buyback_price')[:1]

        # query_set = query_set.annotate(best_buyback_price=subquery2)
        # return query_set

    def annotate_days_of_supply(self, query_set):
        query_set = query_set.annotate(
            days_of_supply=Case(When(last_month_sales=0, then=Value(float('inf'))),
                                default=ExpressionWrapper(Round(Cast('stock', output_field=FloatField()) * Value(30) / F('last_month_sales'), precision=2), output_field=FloatField())))
        return query_set

    def annotate_last_month_sales(self, query_set):
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')

        subquery = Sale.objects.filter(book=OuterRef('pk'), sales_reconciliation__date__range=(start_date, end_date)).values_list(Coalesce(Func(
            'quantity',
            function='SUM',
        ), 0),)

        query_set = query_set.annotate(last_month_sales=subquery)
        return query_set

    def annotate_shelf_space(self, query_set):
        default_thickness = 0.8

        query_set = query_set.annotate(null_defaulted_thickness=Case(When(thickness__isnull=False, then=F('thickness')), default=Value(default_thickness)))

        return query_set.annotate(shelf_space=F('null_defaulted_thickness') * F('stock'))


class RetrieveUpdateDestroyBookAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = BookSerializer
    queryset = Book.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'id'
    isbn_toolbox = ISBNTools()

    def preprocess_multipart_form_data(self, request):
        data = request.data.dict()

        # handle authors, genres
        if data.get('authors', False):
            data['authors'] = [author.strip() for author in data['authors'].split(',')]

        if data.get('genres', False):
            data['genres'] = [genre.strip() for genre in data['genres'].split(',')]

        return data

    def update(self, request, *args, **kwargs):
        data = request.data
        content_type = request.content_type.split(';')[0]

        if content_type == 'multipart/form-data':
            # Preprocess Request when the content-type is not application/json but multipart/form-data
            data = self.preprocess_multipart_form_data(request)

        # if the dimension of a book is zero convert it to None
        data = self.convert_zero_to_null(data)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        res = serializer.data
        setDefaultImage = str2bool(request.data.get('setDefaultImage'))

        # Get and Create the Image
        url = self.bookimage_get_and_create(request, res.get('isbn_13'), setDefaultImage)
        res['image_url'] = url

        return Response(res)

    def convert_zero_to_null(self, data):
        possible_zero_fields = ['pageCount', 'width', 'height', 'thickness']
        for possible_zero_field in possible_zero_fields:
            v = data.get(possible_zero_field, None)
            if v == '0' or v == 0:
                data[possible_zero_field] = None

        return data

    def has_image_bytes(self, request):
        return request.FILES.get('image_bytes', None) is not None

    def has_image_url(self, request):
        return request.data.get('image_url', None) is not None

    def bookimage_get_and_create(self, request, isbn_13, setDefaultImage):
        book = Book.objects.filter(isbn_13=isbn_13)

        # This creates an image in static and sends a file
        if setDefaultImage:
            url = self.isbn_toolbox.get_default_image_url()
        elif self.has_image_bytes(request):
            url = self.isbn_toolbox.commit_image_raw_bytes(request, book[0].id, isbn_13)
        elif self.has_image_url(request):
            url = self.isbn_toolbox.commit_image_url(request, book[0].id, isbn_13)
        else:
            url = self.isbn_toolbox.get_default_image_url()

        obj, created = BookImage.objects.get_or_create(
            book_id=book[0].id,
            defaults={'image_url': url},
        )

        # We need to patch the url if it is a get
        if not created:
            obj.image_url = url
            obj.save()

        return url

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

        return Response({"status": f"Book: {instance.title}(id:{instance.id}) is now a ghost"}, status=status.HTTP_204_NO_CONTENT)


class RetrieveExternalBookImageAPIView(RetrieveAPIView):
    serializer_class = BookImageSerializer
    queryset = BookImage.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'book_id'  # looks up using the book_id field
    lookup_url_kwarg = 'book_id'


class CSVExportBookAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        csv_writer = CSVWriter("books")
        return csv_writer.write_csv(request)