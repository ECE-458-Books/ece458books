from django.urls import path
from .views import ListCreatePurchaseOrderAPIView, RetrieveUpdateDestroyPurchaseOrderAPIView, CSVPurchasesAPIView

app_name = 'purchase_orders'

urlpatterns = [
    path('', ListCreatePurchaseOrderAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyPurchaseOrderAPIView.as_view()),
    path('/csv/import', CSVPurchasesAPIView.as_view())
]
