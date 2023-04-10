from django.urls import path
from .views import ListSalesRecordAPIView, CreateSalesRecordAPIView, RetrieveUpdateDestroySalesReconciliationAPIView, RetrieveSalesReportAPIView, CSVSaleAPIView, CreateSalesReconciliationAPIView

app_name = 'sales'

urlpatterns = [
    path('/sales_reconciliation/create', CreateSalesReconciliationAPIView.as_view()),
    path('/sales_reconciliation', ListSalesRecordAPIView.as_view()),
    path('/sales_record', CreateSalesRecordAPIView.as_view()),
    path('/sales_reconciliation/<id>', RetrieveUpdateDestroySalesReconciliationAPIView.as_view()),
    path('/sales_report/start:<start_date>end:<end_date>', RetrieveSalesReportAPIView.as_view()),
    path('/sales_reconciliation/csv/import', CSVSaleAPIView.as_view()),
]
