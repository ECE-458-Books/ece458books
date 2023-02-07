from django.db.models import Count

from rest_framework import filters, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import VendorSerializer
from .models import Vendor
from .paginations import VendorPagination

from purchase_orders.models import PurchaseOrder

class ListCreateVendorAPIView(ListCreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    pagination_class = VendorPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['name']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

class RetrieveUpdateDestroyVendorAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    lookup_url_kwarg = 'id'

    def destroy(self, request, *args, **kwargs):
        # Check if the request url is valid
        try:
            instance = self.get_object()
        except Exception as e:
            return Response({"error": f"{e}"}, status=status.HTTP_204_NO_CONTENT)

        # Check to see if the Vendor has no purchase orders associated
        queryset = PurchaseOrder.objects.filter(vendor_id=instance.id)

        associated_purchase_order_cnt = len(queryset)
        if(associated_purchase_order_cnt != 0):
            error_msg = {"error": f"{associated_purchase_order_cnt} purchase order(s) associated with vendor:{instance.name}"}
            return Response(error_msg, status=status.HTTP_409_CONFLICT)

        self.perform_destroy(instance)
        return Response({"destroy": "success"}, status=status.HTTP_204_NO_CONTENT)