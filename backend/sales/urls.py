from django.urls import path
from .views import SalesReconciliationAPIView, SaleAPIView

app_name = 'sales'

urlpatterns = [
    path('sales_reconciliation/', SalesReconciliationAPIView.as_view()),
    path('sale/', SaleAPIView.as_view())
]
