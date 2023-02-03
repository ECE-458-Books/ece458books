from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status, filters
from .models import SalesReconciliation, Sale
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .sales_reconciliation import SalesReconciliationFieldsCalculator
from .paginations import SalesReconciliationPagination
from django.db.models import OuterRef, Subquery, F, Sum


class ListCreateSalesReconciliationAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()
    pagination_class = SalesReconciliationPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']
    search_fields = ['date']  # sales__book__isbn13??

    def create(self, request, *args, **kwargs):
        serializer = SalesReconciliationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_sales_reconciliation = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_sales_reconciliation.id
        response_data = SalesReconciliationFieldsCalculator.add_calculated_fields(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        default_query_set = SalesReconciliation.objects.all()
        print(
            default_query_set.annotate(quantity=Subquery(
                Sale.objects.filter(sales_reconciliation=OuterRef('id')).aggregate(
                    revenue=Sum(F('quantity') * F('unit_retail_price'))))))
        # default_query_set = default_query_set.annotate(
        #     quantity=Subquery(Sale.objects.filter(sales_reconciliation=OuterRef('id'))))
        # #.aggregate(
        #revenue=Sum(F('unit_retail_price') * F('quantity')))))
        print(default_query_set)
        # default_query_set = default_query_set.annotate(unit_retail_price=Max('sales__unit_retail_price'))
        # default_query_set = default_query_set.annotate(
        #     sale_revenue=Max(F('sales__unit_retail_price') * F('sales__quantity')))
        # print(Sale.objects.order_by('quantity').values('quantity'))
        return default_query_set


class RetrieveUpdateDestroySalesReconciliationAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesReconciliationSerializer
    lookup_field = 'id'
    pagination_class = SalesReconciliationPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]

    # ordering_fields = '__all__'
    # ordering = ['id']
    # search_fields = ['date']  # sales__book__isbn13??

    def get_queryset(self):
        return SalesReconciliation.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (sales_reconciliation,) = self.get_queryset()
        serializer = self.get_serializer(sales_reconciliation)
        sales_reconciliation_data = SalesReconciliationFieldsCalculator.add_calculated_fields(serializer.data)
        return Response(sales_reconciliation_data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        partial = kwargs.pop('partial', False)
        (sales_reconciliation,) = self.get_queryset()
        serializer = self.get_serializer(sales_reconciliation, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        sales_reconciliation_data = SalesReconciliationFieldsCalculator.add_calculated_fields(serializer.data)
        return Response(sales_reconciliation_data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No sales reconciliation with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None
