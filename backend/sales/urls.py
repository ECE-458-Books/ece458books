from django.urls import path
from .views import ListCreateSalesReconciliationAPIView, RetrieveUpdateDestroySalesReconciliationAPIView, RetrieveSalesReportAPIView

app_name = 'sales'

urlpatterns = [
    path('/sales_reconciliation', ListCreateSalesReconciliationAPIView.as_view()),
    path('/sales_reconciliation/<id>', RetrieveUpdateDestroySalesReconciliationAPIView.as_view()),
    path('/sales_report/start:<start_date>end:<end_date>', RetrieveSalesReportAPIView.as_view())
]
