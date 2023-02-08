from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.views import APIView
from .models import SalesReconciliation, Sale
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveAPIView
from .paginations import SalesReconciliationPagination
from django.db.models import OuterRef, Subquery, Func, Count, Sum, F
from purchase_orders.models import Purchase, PurchaseOrder
from purchase_orders.serializers import PurchaseOrderSerializer
import datetime, pytz
from datetime import datetime, timedelta
from books.models import Book


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

class RetrieveSalesReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, start_date, end_date):
        daily_revenues = {}
        daily_costs = {}
        daily_profits = {}

        # Get range of dates from starting date to ending date
        dates = self.dates_range(start_date, end_date)

        for date in dates:
            date_str = date.strftime("%Y-%m-%d")
            self.get_daily_revenues(daily_revenues, date_str)
            self.get_daily_costs(daily_costs, date_str)
            daily_profits[date_str] = daily_revenues[date_str] - daily_costs[date_str]

        total_cost = sum(daily_costs.values())
        total_revenue = sum(daily_revenues.values())
        total_profit = total_revenue - total_cost

        books_sold_quantities = list(SalesReconciliation.objects.filter(date__range=(start_date, end_date)).values(book_id=F('sales__book')).annotate(num_books_sold=Sum('sales__quantity')).annotate(book_revenue=Sum('sales__revenue')).order_by('-num_books_sold'))

        # order by date, then by id, since higher id means was entered later than lower id, so could mean more recent price... just need any way to decide on one price if two separate purchases are logged on same day of same book to know which unit wholesale price to use
        books_purchased_quantities = list(PurchaseOrder.objects.filter(date__lte=end_date).values('purchases__book').annotate(num_books_purchased=Sum('purchases__quantity')).values('purchases__book', 'num_books_purchased'))
        book_id_to_num_purchased_dict = {x['purchases__book']:x['num_books_purchased'] for x in books_purchased_quantities}
        for i in [x for x in books_sold_quantities]:
            most_recent_unit_wholesale_price = PurchaseOrder.objects.filter(date__lte=end_date).order_by('-date', '-id').annotate(book_wholesale_price=Subquery(Purchase.objects.filter(purchase_order=OuterRef('id')).filter(book=i['book_id']).values('unit_wholesale_price'))).values('book_wholesale_price').exclude(book_wholesale_price=None).first()['book_wholesale_price']

            i['total_cost_most_recent'] = round(most_recent_unit_wholesale_price * book_id_to_num_purchased_dict[i['book_id']], 2)
        
        for i in books_sold_quantities:
            i['book_title'] = Book.objects.filter(id=i['book_id']).get().title

        return Response({
            "total_summary":{
                "revenue": total_revenue,
                "cost": total_cost,
                "profit": total_profit,
            },
            "daily_summary":  # date, revenue, cost, profit
                [{"date": date, "revenue": revenue, "cost": cost, "profit": profit } for (date, revenue, cost, profit) in zip(daily_revenues.keys(), daily_revenues.values(), daily_costs.values(), daily_profits.values())]
            ,
            "top_books":  # title, quantity, total_revenue, total_cost, total_profit
            books_sold_quantities
            
        })

    def get_daily_costs(self, daily_costs, date: str):
        purchase_orders = PurchaseOrder.objects.filter(date=date)
        if len(purchase_orders) == 0:
            daily_costs[date] = 0
            return
        for purchase_order in purchase_orders:
            serializer = PurchaseOrderSerializer(purchase_order)
            daily_costs[date] = serializer.data['total_cost']

    def get_daily_revenues(self, daily_revenues, date: str):
        sales_reconciliations = SalesReconciliation.objects.filter(date=date)
        if len(sales_reconciliations) == 0:
            daily_revenues[date] = 0
            return
        for sales_reconciliation in sales_reconciliations:
            serializer = SalesReconciliationSerializer(sales_reconciliation)
            daily_revenues[date] = serializer.data['total_revenue']

    def dates_range(self, start: str, end: str):
        date_format = "%Y-%m-%d"
        start_date = datetime.strptime(start, date_format)
        end_date = datetime.strptime(end, date_format)
        delta = end_date - start_date
        days = [start_date + timedelta(days=num_days) for num_days in range(delta.days+1)]
        return days

