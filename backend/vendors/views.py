from django.db.models import Count, OuterRef, Subquery, Func
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import VendorSerializer
from .models import Vendor
from .paginations import VendorPagination

from purchase_orders.models import PurchaseOrder
from utils.general import str2bool

class ListCreateVendorAPIView(ListCreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    pagination_class = VendorPagination
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['buyback_rate']
    ordering_fields = '__all__'
    ordering = ['name']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)
    
    def get_queryset(self):
        default_query_set = Vendor.objects.all()

        default_query_set = default_query_set.annotate(
            num_purchase_orders=Subquery(
                PurchaseOrder.objects.filter(
                    vendor=OuterRef('id')
                ).values_list(
                    Func(
                        'id',
                        function='COUNT',
                    ),
                )
            )
        )

        if str2bool(self.request.query_params.get('has_buyback_policy')):
            default_query_set = default_query_set.filter(buyback_rate__isnull=False)
        
        return default_query_set


class RetrieveUpdateDestroyVendorAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes=[IsAuthenticated]
    lookup_url_kwarg = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        ret = request.data

        # if buyback_rate is not specified default is to change it to null
        if request.data.get('buyback_rate', None) is None:
            ret['buyback_rate'] = None

        serializer = self.get_serializer(instance, data=ret, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

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