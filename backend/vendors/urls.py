from django.urls import path
from .views import ListCreateVendorAPIView, RetrieveUpdateDestroyVendorAPIView, RetrieveVendorBuybackUnitPriceAPIView

app_name = 'vendors'

urlpatterns = [
    path('', ListCreateVendorAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyVendorAPIView.as_view()),
    path('/<id>/buybackunitprice', RetrieveVendorBuybackUnitPriceAPIView.as_view())
]
