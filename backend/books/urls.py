from django.urls import path
from .views import ISBNSearchView, ListCreateBookAPIView, RetrieveUpdateDestroyBookAPIView, RetrieveExternalBookImageAPIView, CSVExportBookAPIView, CreateBookInventoryCorrectionAPIView

app_name='books'

urlpatterns = [
    path('', ListCreateBookAPIView.as_view()),
    path('/csv/export', CSVExportBookAPIView.as_view()),
    path('/image/<book_id>', RetrieveExternalBookImageAPIView.as_view()),
    path('/inventory_correction/<book_id>', CreateBookInventoryCorrectionAPIView.as_view()),
    path('/isbns', ISBNSearchView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBookAPIView.as_view()),
]