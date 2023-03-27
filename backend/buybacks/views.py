import datetime, pytz
from datetime import datetime
from django.db.models import Sum, OuterRef, Subquery, Func, Count, F

from rest_framework import status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from books.models import Book
from helpers.csv_reader import CSVReader
from utils.permissions import CustomBasePermission

from .paginations import BuybackPagination
from .models import Buyback, BuybackOrder
from .serializers import BuybackOrderSerializer

class ListCreateBuybackAPIView(ListCreateAPIView):
    permission_classes = [CustomBasePermission]
    serializer_class = BuybackOrderSerializer
    queryset = BuybackOrder.objects.all()
    pagination_class = BuybackPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['-date']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        # Add User to BuybackOrder 
        request.data['user'] = request.user.id

        serializer = BuybackOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_buyback_order = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_buyback_order.id
        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        default_query_set = BuybackOrder.objects.all()

        # Create a subquery to aggregate the 'revenue' value for each buyback in BuybackOrder
        revenue_subquery = Buyback.objects.filter(buyback_order=OuterRef('id')).values_list(Func(
            'revenue',
            function='SUM',
        ),)

        default_query_set = default_query_set.annotate(total_revenue=Subquery(revenue_subquery))

        # Filter by quantity of books in BuybackOrder
        num_books_subquery = Buyback.objects.filter(buyback_order=OuterRef('id')).values_list(Func('quantity', function='SUM'),)

        default_query_set = default_query_set.annotate(num_books=Subquery(num_books_subquery))

        default_query_set = default_query_set.annotate(num_unique_books=Count('buybacks__book', distinct=True))

        default_query_set = default_query_set.annotate(vendor_name=F('vendor__name'))

        default_query_set = default_query_set.annotate(username=F('user__username'))

        # Filter by vendor
        vendor = self.request.GET.get('vendor')
        if vendor is not None:
            default_query_set = default_query_set.filter(vendor=vendor)

        # Filter by date
        start_date = self.request.GET.get('start')
        end_date = self.request.GET.get('end')
        if start_date is not None and end_date is not None:
            default_query_set = default_query_set.filter(date__range=(start_date, end_date))
        elif start_date is not None:
            default_query_set = default_query_set.filter(date__range=(start_date, datetime.datetime.now(pytz.timezone('US/Eastern'))))

        # Filter by book
        book = self.request.GET.get('book')
        if book is not None:
            default_query_set = default_query_set.filter(buybacks__book=book).distinct()

        # Filter by >= revenue
        buyback_revenue__gte = self.request.GET.get('buyback_revenue__gte')
        if buyback_revenue__gte is not None:
            default_query_set = default_query_set.filter(buybacks__revenue__gte=buyback_revenue__gte).distinct()

        # Filter by <= revenue
        buyback_revenue__lte = self.request.GET.get('buyback_revenue__lte')
        if buyback_revenue__lte is not None:
            default_query_set = default_query_set.filter(buybacks__revenue__lte=buyback_revenue__lte).distinct()

        # Filter by <= revenue
        buyback_revenue = self.request.GET.get('buyback_revenue')
        if buyback_revenue is not None:
            default_query_set = default_query_set.filter(buybacks__revenue=buyback_revenue).distinct()

        # Filter by >= quantity
        buyback_quantity__gte = self.request.GET.get('buyback_quantity__gte')
        if buyback_quantity__gte is not None:
            default_query_set = default_query_set.filter(buybacks__quantity__gte=buyback_quantity__gte).distinct()

        # Filter by <= quantity
        buyback_quantity__lte = self.request.GET.get('buyback_quantity__lte')
        if buyback_quantity__lte is not None:
            default_query_set = default_query_set.filter(buybacks__quantity__lte=buyback_quantity__lte).distinct()

        # Filter by == quantity
        buyback_quantity = self.request.GET.get('buyback_quantity')
        if buyback_quantity is not None:
            default_query_set = default_query_set.filter(buybacks__quantity=buyback_quantity).distinct()

        # Filter by >= unit_buyback_price
        buyback_unit_buyback_price__gte = self.request.GET.get('buyback_unit_buyback_price__gte')
        if buyback_unit_buyback_price__gte is not None:
            default_query_set = default_query_set.filter(buybacks__unit_buyback_price__gte=buyback_unit_buyback_price__gte).distinct()

        # Filter by <= unit_buyback_price
        buyback_unit_buyback_price__lte = self.request.GET.get('buyback_unit_buyback_price__lte')
        if buyback_unit_buyback_price__lte is not None:
            default_query_set = default_query_set.filter(buybacks__unit_buyback_price__lte=buyback_unit_buyback_price__lte).distinct()

        # Filter by == unit_buyback_price
        buyback_unit_buyback_price = self.request.GET.get('buyback_unit_buyback_price')
        if buyback_unit_buyback_price is not None:
            default_query_set = default_query_set.filter(buybacks__unit_buyback_price=buyback_unit_buyback_price).distinct()

        return default_query_set


class RetrieveUpdateDestroyBuybackAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [CustomBasePermission]
    serializer_class = BuybackOrderSerializer
    lookup_field = 'id'
    pagination_class = BuybackPagination

    def get_queryset(self):
        return BuybackOrder.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (buyback_order,) = self.get_queryset()
        serializer = self.get_serializer(buyback_order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        partial = kwargs.pop('partial', False)
        (buyback_order,) = self.get_queryset()
        serializer = self.get_serializer(buyback_order, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No buyback order with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None

    def destroy(self, request, *args, **kwargs):
        buyback_book_quantities = Buyback.objects.filter(buyback_order=self.get_object().id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        for buyback_book_quantity in buyback_book_quantities:
            book_to_remove_buyback = Book.objects.filter(id=buyback_book_quantity['book']).get()
            book_to_remove_buyback.stock += buyback_book_quantity['num_books']
            book_to_remove_buyback.save()
        return super().destroy(request, *args, **kwargs)


class CSVBuybackAPIView(APIView):
    permission_classes = [CustomBasePermission]

    def post(self, request: Request):
        csv_reader = CSVReader("buybacks")
        return csv_reader.read_csv(request)
