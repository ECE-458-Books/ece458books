from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import SalesReconciliation
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .sales_reconciliation import SalesReconciliationFieldsCalculator


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
        response_data = SalesReconciliationFieldsCalculator.add_calculated_fields(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)


class RetrieveUpdateDestroySalesReconciliationAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SalesReconciliationSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return SalesReconciliation.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No sales reconciliation with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        (sales_reconciliation,) = self.get_queryset()
        serializer = self.get_serializer(sales_reconciliation)
        sales_reconciliation_data = SalesReconciliationFieldsCalculator.add_calculated_fields(serializer.data)
        return Response(sales_reconciliation_data, status=status.HTTP_200_OK)
