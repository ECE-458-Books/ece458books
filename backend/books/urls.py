from django.urls import path
from .views import ISBNSearchView, ListCreateBookAPIView, RetrieveUpdateDestroyBookAPIView

app_name='books'

urlpatterns = [
    path('', ListCreateBookAPIView.as_view()),
    path('<str:isbn_13>', RetrieveUpdateDestroyBookAPIView.as_view()),
    path('isbns', ISBNSearchView.as_view()),
]