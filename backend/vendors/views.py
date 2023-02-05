from django.db.models import Count

from rest_framework import filters, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import VendorSerializer
from .models import Vendor
from .paginations import VendorPagination

class ListCreateVendorAPIView(ListCreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    pagination_class = VendorPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['name']

class RetrieveUpdateDestroyVendorAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    lookup_url_kwarg = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Uncomment when purchase order is linked
        # Check to see if the Vendor has no purchase orders associated
        # associated_purchase_order_cnt = len(instance.purchase_order_set.all())
        # if(associated_purchase_order_cnt != 0):
        #     error_msg = {"error": f"{associated_purchase_order_cnt} purchase order(s) associated with vendor:{instance.name}"}
        #     return Response(error_msg, status=status.HTTP_400_BAD_REQUEST)

        self.perform_destroy(instance)
        return Response({"destroy": "success"}, status=status.HTTP_204_NO_CONTENT)