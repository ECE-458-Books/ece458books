from django.urls import path
from .views import ISBNSearchView

app_name='books'

urlpatterns = [
    path('isbns', ISBNSearchView.as_view()),
]