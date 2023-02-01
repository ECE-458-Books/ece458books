from django.urls import path
from .views import SalesReconciliationAPIView, RetrieveUpdateDestroySalesReconciliationAPIView

app_name = 'sales'

urlpatterns = [
    path('sales_reconciliation/', SalesReconciliationAPIView.as_view()),
    path('sales_reconciliation/<id>', RetrieveUpdateDestroySalesReconciliationAPIView.as_view())
]
