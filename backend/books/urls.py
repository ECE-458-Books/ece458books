from django.urls import path
from .views import ISBNSearchView, ListCreateBookAPIView, RetrieveUpdateDestroyBookAPIView, RetrieveUpdateBookImageAPIView

app_name='books'

urlpatterns = [
    path('/image/<book_id>', RetrieveUpdateBookImageAPIView.as_view()),
    path('/isbns', ISBNSearchView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBookAPIView.as_view()),
    path('', ListCreateBookAPIView.as_view()),
]