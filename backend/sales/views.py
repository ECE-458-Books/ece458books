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
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        response_data = self.add_calculated_fields(serializer)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def add_calculated_fields(self, serializer):
        total_revenue = 0
        books = set()
        num_books = 0
        for sale in serializer.data['sales']:
            sale_revenue = sale['quantity'] * sale['unit_retail_price']
            total_revenue += sale_revenue
            books.add(sale['book'])
            num_books += sale['quantity']
        response_data = serializer.data
        response_data['total_revenue'] = total_revenue
        response_data['num_unique_books'] = len(books)
        response_data['num_books'] = num_books
        return response_data
