from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import SalesReconciliation
from rest_framework.generics import ListCreateAPIView


class SalesReconciliationAPIView(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = SalesReconciliationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_sales_reconciliation = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_sales_reconciliation.id
        response_data = self.add_calculated_fields(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)

    def add_calculated_fields(self, data):
        total_revenue = 0
        books = set()
        num_books = 0
        for sale in data['sales']:
            sale_revenue = sale['quantity'] * sale['unit_retail_price']
            total_revenue += sale_revenue
            books.add(sale['book'])
            num_books += sale['quantity']
        data['total_revenue'] = total_revenue
        data['num_unique_books'] = len(books)
        data['num_books'] = num_books
        return data


# class RetrieveUpdateDestroySalesReconciliationAPIView(RetrieveUpdateDestroyAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = SalesReconciliationSerializer
#     queryset = SalesReconciliation.objects.all()