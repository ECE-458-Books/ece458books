from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import SaleSerializer, SalesReconciliationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Sale, SalesReconciliation
from .renderers import SalesReconciliationJSONRenderer
from rest_framework.generics import ListCreateAPIView
from drf_multiple_model.views import ObjectMultipleModelAPIView

# Create your views here.

# class SalesReconciliationAPIView(APIView):
#     permission_classes = (IsAuthenticated,)
#     renderer_classes = (SalesReconciliationJSONRenderer,)
#     serializer_class = SalesReconciliationSerializer

#     def post(self, request):
#         # request should contain a list of the sales
#         sale = Sale()
#         # sales = Sale.objects.all()
#         sales_recon = SalesReconciliationSerializer([sale], many=True)
#         return Response(sales_recon.data, status=status.HTTP_200_OK)

#     def get(self, request):
#         # request should contain a list of the sales
#         sale = Sale()
#         # sales = Sale.objects.all()
#         sales_recon = SalesReconciliationSerializer([sale], many=True)
#         return Response(sales_recon.data, status=status.HTTP_200_OK)


class SalesReconciliationAPIView(ListCreateAPIView):
    permission_classes = (AllowAny,)
    # renderer_classes = (SalesReconciliationJSONRenderer,)
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()

    def create(self, request, *args, **kwargs):
        # Need to first create the sales in the DB
        print(request.data)

        # sales_reconciliation = SalesReconciliation.objects.create(date=request['date'])
        # for sale in request['sales']:
        #     Sale.objects.create()
        # serializer = SaleAPIView.serializer_class(data=request.data, many=True)
        # serializer.is_valid(raise_exception=True)
        # serializer.save()
        # # Sale.objects.create(**sale)
        # # serializer = self.serializer_class(data=request.data)
        # # serializer.is_valid(raise_exception=True)
        # # serializer.save()
        return Response({}, status=status.HTTP_201_CREATED)


# class SalesReconciliationAPIView(ObjectMultipleModelAPIView):
#     querylist = [
#         {'queryset': }
#     ]


class SaleAPIView(ListCreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = SaleSerializer
    queryset = Sale.objects.all()
