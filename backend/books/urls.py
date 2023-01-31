from django.urls import path
from .views import ISBNSearchView, ListCreateBookAPIView, RetrieveUpdateDestroyBookAPIView

app_name='books'

urlpatterns = [
    path('isbns', ISBNSearchView.as_view()),
    path('<isbn_13>', RetrieveUpdateDestroyBookAPIView.as_view()),
    path('', ListCreateBookAPIView.as_view()),
]