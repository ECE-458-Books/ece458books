from django.urls import path
from .views import SalesReconciliationAPIView

app_name = 'sales'

urlpatterns = [path('sales_reconciliation/', SalesReconciliationAPIView.as_view())]
