from django.urls import path
from .views import ListCreateBuybackAPIView, RetrieveUpdateDestroyBuybackAPIView

app_name = 'buybacks'

urlpatterns = [
    path('', ListCreateBuybackAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBuybackAPIView.as_view())
]
