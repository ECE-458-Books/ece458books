from rest_framework.permissions import IsAuthenticated
from .serializers import PurchaseOrderSerializer
from rest_framework.response import Response
from rest_framework import status, filters
from .models import Purchase, PurchaseOrder
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .purchase_order import PurchaseOrderFieldsCalculator
from .paginations import PurchaseOrderPagination
from django.db.models import OuterRef, Subquery, Func, Count
import datetime, pytz


class ListCreatePurchaseOrderAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseOrderSerializer
    queryset = PurchaseOrder.objects.all()
    pagination_class = PurchaseOrderPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def create(self, request, *args, **kwargs):
        serializer = PurchaseOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_purchase_order = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_purchase_order.id
        response_data = PurchaseOrderFieldsCalculator.add_calculated_fields(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        default_query_set = PurchaseOrder.objects.all()

        # Create a subquery to aggregate the 'cost' value for each purchase in PurchaseOrder
        cost_subquery = Purchase.objects.filter(
            purchase_order=OuterRef('id')
        ).values_list(
            Func(
                'cost',
                function='SUM',
            ),
        )

        default_query_set = default_query_set.annotate(
            total_cost=Subquery(cost_subquery)
        )
        
        # Filter by quantity of books in PurchaseOrder
        num_books_subquery = Purchase.objects.filter(
            purchase_order=OuterRef('id')
        ).values_list(
            Func(
                'quantity',
                function='SUM'
            ),
        )

        default_query_set = default_query_set.annotate(num_books=Subquery(num_books_subquery))

        default_query_set = default_query_set.annotate(num_unique_books=Count('purchases__book', distinct=True))

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
            default_query_set = default_query_set.filter(purchases__book=book).distinct()

        # Filter by >= cost
        purchase_cost__gte = self.request.GET.get('purchase_cost__gte')
        if purchase_cost__gte is not None:
            default_query_set = default_query_set.filter(purchases__cost__gte=purchase_cost__gte).distinct()

        # Filter by <= cost
        purchase_cost__lte = self.request.GET.get('purchase_cost__lte')
        if purchase_cost__lte is not None:
            default_query_set = default_query_set.filter(purchases__cost__lte=purchase_cost__lte).distinct()
        
        # Filter by <= cost
        purchase_cost = self.request.GET.get('purchase_cost')
        if purchase_cost is not None:
            default_query_set = default_query_set.filter(purchases__cost=purchase_cost).distinct()
        
        # Filter by >= quantity
        purchase_quantity__gte = self.request.GET.get('purchase_quantity__gte')
        if purchase_quantity__gte is not None:
            default_query_set = default_query_set.filter(purchases__quantity__gte=purchase_quantity__gte).distinct()

        # Filter by <= quantity
        purchase_quantity__lte = self.request.GET.get('purchase_quantity__lte')
        if purchase_quantity__lte is not None:
            default_query_set = default_query_set.filter(purchases__quantity__lte=purchase_quantity__lte).distinct()

        # Filter by == quantity
        purchase_quantity = self.request.GET.get('purchase_quantity')
        if purchase_quantity is not None:
            default_query_set = default_query_set.filter(purchases__quantity=purchase_quantity).distinct()
        
        # Filter by >= unit_retail_price
        purchase_unit_wholesale_price__gte = self.request.GET.get('purchase_unit_wholesale_price__gte')
        if purchase_unit_wholesale_price__gte is not None:
            default_query_set = default_query_set.filter(purchases__unit_wholesale_price__gte=purchase_unit_wholesale_price__gte).distinct()
        
        # Filter by <= unit_retail_price
        purchase_unit_wholesale_price__lte = self.request.GET.get('purchase_unit_wholesale_price__lte')
        if purchase_unit_wholesale_price__lte is not None:
            default_query_set = default_query_set.filter(purchases__unit_wholesale_price__lte=purchase_unit_wholesale_price__lte).distinct()
        
        # Filter by == unit_retail_price
        purchase_unit_wholesale_price = self.request.GET.get('purchase_unit_wholesale_price')
        if purchase_unit_wholesale_price is not None:
            default_query_set = default_query_set.filter(purchases__unit_wholesale_price=purchase_unit_wholesale_price).distinct()
        
        return default_query_set


class RetrieveUpdateDestroyPurchaseOrderAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PurchaseOrderSerializer
    lookup_field = 'id'
    pagination_class = PurchaseOrderPagination

    def get_queryset(self):
        return PurchaseOrder.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (purchase_order,) = self.get_queryset()
        serializer = self.get_serializer(purchase_order)
        purchase_order_data = PurchaseOrderFieldsCalculator.add_calculated_fields(serializer.data)
        return Response(purchase_order_data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        partial = kwargs.pop('partial', False)
        (purchase_order,) = self.get_queryset()
        serializer = self.get_serializer(purchase_order, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        purchase_order_data = PurchaseOrderFieldsCalculator.add_calculated_fields(serializer.data)
        return Response(purchase_order_data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No purchase orders with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None
