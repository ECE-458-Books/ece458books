from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status, filters
from .models import SalesReconciliation, Sale
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .paginations import SalesReconciliationPagination
from django.db.models import OuterRef, Subquery, Func, Count
import datetime, pytz


class ListCreateSalesReconciliationAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()
    pagination_class = SalesReconciliationPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        serializer = SalesReconciliationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_sales_reconciliation = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_sales_reconciliation.id
        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        default_query_set = SalesReconciliation.objects.all()

        # Create a subquery to aggregate the 'revenue' value for each sale in SalesReconciliation
        revenue_subquery = Sale.objects.filter(
            sales_reconciliation=OuterRef('id')
        ).values_list(
            Func(
                'revenue',
                function='SUM',
            ),
        )

        default_query_set = default_query_set.annotate(
            total_revenue=Subquery(revenue_subquery)
        )
        
        # Filter by quantity of books in SalesReconciliation
        num_books_subquery = Sale.objects.filter(
            sales_reconciliation=OuterRef('id')
        ).values_list(
            Func(
                'quantity',
                function='SUM'
            ),
        )

        default_query_set = default_query_set.annotate(num_books=Subquery(num_books_subquery))

        default_query_set = default_query_set.annotate(num_unique_books=Count('sales__book', distinct=True))

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
            default_query_set = default_query_set.filter(sales__book=book).distinct()

        # Filter by >= revenue
        sale_revenue__gte = self.request.GET.get('sale_revenue__gte')
        if sale_revenue__gte is not None:
            default_query_set = default_query_set.filter(sales__revenue__gte=sale_revenue__gte).distinct()

        # Filter by <= revenue
        sale_revenue__lte = self.request.GET.get('sale_revenue__lte')
        if sale_revenue__lte is not None:
            default_query_set = default_query_set.filter(sales__revenue__lte=sale_revenue__lte).distinct()
        
        # Filter by <= revenue
        sale_revenue = self.request.GET.get('sale_revenue')
        if sale_revenue is not None:
            default_query_set = default_query_set.filter(sales__revenue=sale_revenue).distinct()
        
        # Filter by >= quantity
        sale_quantity__gte = self.request.GET.get('sale_quantity__gte')
        if sale_quantity__gte is not None:
            default_query_set = default_query_set.filter(sales__quantity__gte=sale_quantity__gte).distinct()

        # Filter by <= quantity
        sale_quantity__lte = self.request.GET.get('sale_quantity__lte')
        if sale_quantity__lte is not None:
            default_query_set = default_query_set.filter(sales__quantity__lte=sale_quantity__lte).distinct()

        # Filter by == quantity
        sale_quantity = self.request.GET.get('sale_quantity')
        if sale_quantity is not None:
            default_query_set = default_query_set.filter(sales__quantity=sale_quantity).distinct()
        
        # Filter by >= unit_retail_price
        sale_unit_retail_price__gte = self.request.GET.get('sale_unit_retail_price__gte')
        if sale_unit_retail_price__gte is not None:
            default_query_set = default_query_set.filter(sales__unit_retail_price__gte=sale_unit_retail_price__gte).distinct()
        
        # Filter by <= unit_retail_price
        sale_unit_retail_price__lte = self.request.GET.get('sale_unit_retail_price__lte')
        if sale_unit_retail_price__lte is not None:
            default_query_set = default_query_set.filter(sales__unit_retail_price__lte=sale_unit_retail_price__lte).distinct()
        
        # Filter by == unit_retail_price
        sale_unit_retail_price = self.request.GET.get('sale_unit_retail_price')
        if sale_unit_retail_price is not None:
            default_query_set = default_query_set.filter(sales__unit_retail_price=sale_unit_retail_price).distinct()
        
        return default_query_set


class RetrieveUpdateDestroySalesReconciliationAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesReconciliationSerializer
    lookup_field = 'id'
    pagination_class = SalesReconciliationPagination

    def get_queryset(self):
        return SalesReconciliation.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (sales_reconciliation,) = self.get_queryset()
        serializer = self.get_serializer(sales_reconciliation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        partial = kwargs.pop('partial', False)
        (sales_reconciliation,) = self.get_queryset()
        serializer = self.get_serializer(sales_reconciliation, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No sales reconciliation with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None
