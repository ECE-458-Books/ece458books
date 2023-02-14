from django.urls import path
from .views import ISBNSearchView, ListBookAPIView, CreateBookAPIView, RetrieveUpdateDestroyBookAPIView

app_name='books'

urlpatterns = [
    path('/isbns', ISBNSearchView.as_view()),
    path('', ListBookAPIView.as_view()),
    path('/add', CreateBookAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBookAPIView.as_view()),
]