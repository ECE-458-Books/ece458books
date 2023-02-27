from django.urls import path
from .views import ListCreateBuybackAPIView, RetrieveUpdateDestroyBuybackAPIView, CSVBuybackAPIView

app_name = 'buybacks'

urlpatterns = [
    path('', ListCreateBuybackAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBuybackAPIView.as_view()),
    path('/csv/import', CSVBuybackAPIView.as_view()),
]
