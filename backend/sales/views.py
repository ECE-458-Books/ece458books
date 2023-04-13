from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer, SalesRecordSerializer
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, filters
from rest_framework.views import APIView
from .models import SalesReconciliation, Sale
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from .paginations import SalesReconciliationPagination
from django.db.models import OuterRef, Subquery, Func, Count, Sum, F
from purchase_orders.models import Purchase, PurchaseOrder
from purchase_orders.serializers import PurchaseOrderSerializer
from buybacks.serializers import BuybackOrderSerializer
import datetime, pytz
from datetime import datetime, timedelta
from books.models import Book
from helpers.csv_reader import CSVReader
from buybacks.models import BuybackOrder
from utils.permissions import CustomBasePermission
from .parsers import XMLParser
from .sales_record_permissions import SalesRecordsWhitelistPermission, BodySizePermission
from .ordering_filters import CustomOrderingFilter

class CreateSalesReconciliationAPIView(CreateAPIView):
    permission_classes = [CustomBasePermission]
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()
    pagination_class = SalesReconciliationPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def create(self, request, *args, **kwargs):
        # Add User to SalesReconciliation
        request.data['user'] = request.user.id

        serializer = SalesReconciliationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_sales_reconciliation = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_sales_reconciliation.id
        return Response(response_data, status=status.HTTP_201_CREATED)


class CreateSalesRecordAPIView(CreateAPIView):
    permission_classes = [SalesRecordsWhitelistPermission, BodySizePermission]
    authentication_classes = []
    serializer_class = SalesRecordSerializer
    parser_classes = [XMLParser]

    def create(self, request, *args, **kwargs):
        serializer = SalesRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_sales_reconciliation = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_sales_reconciliation.id
        return Response(response_data, status=status.HTTP_201_CREATED)


class ListSalesRecordAPIView(ListAPIView):
    permission_classes = [CustomBasePermission]
    serializer_class = SalesRecordSerializer
    queryset = SalesReconciliation.objects.all()
    pagination_class = SalesReconciliationPagination
    filter_backends = [CustomOrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['-date']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def get_queryset(self):
        default_query_set = SalesReconciliation.objects.all()

        # Create a subquery to aggregate the 'revenue' value for each sale in SalesReconciliation
        revenue_subquery = Sale.objects.filter(sales_reconciliation=OuterRef('id')).values_list(Func(
            'revenue',
            function='SUM',
        ),)

        default_query_set = default_query_set.annotate(total_revenue=Subquery(revenue_subquery))

        # Filter by quantity of books in SalesReconciliation
        num_books_subquery = Sale.objects.filter(sales_reconciliation=OuterRef('id')).values_list(Func('quantity', function='SUM'),)

        default_query_set = default_query_set.annotate(num_books=Subquery(num_books_subquery))

        default_query_set = default_query_set.annotate(num_unique_books=Count('sales__book', distinct=True))

        default_query_set = default_query_set.annotate(username=F('user__username'))

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
    permission_classes = [CustomBasePermission]
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

    def destroy(self, request, *args, **kwargs):
        sale_book_quantities = Sale.objects.filter(sales_reconciliation=self.get_object().id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        for sale_book_quantity in sale_book_quantities:
            book_to_remove_sale = Book.objects.filter(id=sale_book_quantity['book']).get()
            book_to_remove_sale.stock += sale_book_quantity['num_books']
            book_to_remove_sale.save()
        return super().destroy(request, *args, **kwargs)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No sales reconciliation with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None


class RetrieveSalesReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, start_date, end_date):
        daily_sales = {}
        daily_purchases = {}
        daily_profits = {}
        daily_buybacks = {}

        # Get range of dates from starting date to ending date
        dates = self.dates_range(start_date, end_date)

        for date in dates:
            date_str = date.strftime("%Y-%m-%d")
            self.get_daily_sales(daily_sales, date_str)
            self.get_daily_purchases(daily_purchases, date_str)
            self.get_daily_buybacks(daily_buybacks, date_str)
            daily_profits[date_str] = round(daily_sales[date_str] + daily_buybacks[date_str] - daily_purchases[date_str], 2)

        total_cost = round(sum(daily_purchases.values()), 2)
        total_sales_revenue = round(sum(daily_sales.values()), 2)
        total_buybacks_revenue = round(sum(daily_buybacks.values()), 2)
        total_revenue = round(sum(list(daily_sales.values()) + list(daily_buybacks.values())), 2)
        total_profit = round(total_revenue - total_cost, 2)

        sales_data_by_book = list(
            SalesReconciliation.objects.filter(date__range=(start_date, end_date)).values(book_id=F('sales__book')).exclude(book_id=None).annotate(num_books_sold=Sum('sales__quantity')).annotate(
                book_revenue=Sum('sales__revenue')).order_by('-num_books_sold'))[:10]

        for book_sale in list(sales_data_by_book):
            try:
                most_recent_unit_wholesale_price = PurchaseOrder.objects.filter(date__lte=end_date).order_by('-date', '-id').annotate(
                    book_wholesale_price=Subquery(Purchase.objects.filter(purchase_order=OuterRef('id')).filter(
                        book=book_sale['book_id']).order_by('-id')[:1].values('unit_wholesale_price'))).values('book_wholesale_price').exclude(
                            book_wholesale_price=None).first()['book_wholesale_price']
                book_sale['is_estimated_cost_most_recent'] = False
            except:
                # use 70% of retail price, since book has not been previously documented as being purchased
                most_recent_unit_wholesale_price = .7 * Book.objects.get(id=book_sale['book_id']).retail_price
                book_sale['is_estimated_cost_most_recent'] = True
            book_sale['total_cost_most_recent'] = round(most_recent_unit_wholesale_price * book_sale['num_books_sold'], 2)

        for book_sale in sales_data_by_book:
            book_sale['book_title'] = Book.objects.filter(id=book_sale['book_id']).get().title

            book_sale['book_profit'] = round(book_sale['book_revenue'] - book_sale['total_cost_most_recent'], 2)

        return Response({
            "total_summary": {
                "sales_revenue": total_sales_revenue,
                "buybacks_revenue": total_buybacks_revenue,
                "revenue": total_revenue,
                "cost": total_cost,
                "profit": total_profit,
            },
            "daily_summary":  # date, revenue, cost, profit
                [{
                    "date": date,
                    "sales_revenue": sales_revenue,
                    "buybacks_revenue": buybacks_revenue,
                    "cost": cost,
                    "profit": profit
                } for (date, sales_revenue, buybacks_revenue, cost, profit) in zip(daily_sales.keys(), daily_sales.values(), daily_buybacks.values(), daily_purchases.values(), daily_profits.values())
                ],
            "top_books":  # title, quantity, total_revenue, total_cost, total_profit
                sales_data_by_book
        })

    def get_daily_buybacks(self, daily_buybacks, date: str):
        buyback_orders = BuybackOrder.objects.filter(date=date)
        if len(buyback_orders) == 0:
            daily_buybacks[date] = 0
            return
        for buyback_order in buyback_orders:
            serializer = BuybackOrderSerializer(buyback_order)
            if date not in daily_buybacks.keys():
                daily_buybacks[date] = serializer.data['total_revenue']
            else:
                daily_buybacks[date] += serializer.data['total_revenue']

    def get_daily_purchases(self, daily_costs, date: str):
        purchase_orders = PurchaseOrder.objects.filter(date=date)
        if len(purchase_orders) == 0:
            daily_costs[date] = 0
            return
        for purchase_order in purchase_orders:  # sum the total costs for the day
            serializer = PurchaseOrderSerializer(purchase_order)
            if date not in daily_costs.keys():
                daily_costs[date] = serializer.data['total_cost']
            else:
                daily_costs[date] += serializer.data['total_cost']

    def get_daily_sales(self, daily_revenues, date: str):
        sales_reconciliations = SalesReconciliation.objects.filter(date=date)
        if len(sales_reconciliations) == 0:
            daily_revenues[date] = 0
            return
        for sales_reconciliation in sales_reconciliations:  # sum the total revenue for the day
            serializer = SalesReconciliationSerializer(sales_reconciliation)
            if date not in daily_revenues.keys():
                daily_revenues[date] = serializer.data['total_revenue']
            else:
                daily_revenues[date] += serializer.data['total_revenue']

    def dates_range(self, start: str, end: str):
        date_format = "%Y-%m-%d"
        start_date = datetime.strptime(start, date_format)
        end_date = datetime.strptime(end, date_format)
        delta = end_date - start_date
        days = [start_date + timedelta(days=num_days) for num_days in range(delta.days + 1)]
        return days


class CSVSaleAPIView(APIView):
    permission_classes = [CustomBasePermission]

    def post(self, request: Request):
        csv_reader = CSVReader("sales")
        return csv_reader.read_csv(request)
