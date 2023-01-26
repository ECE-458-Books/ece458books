from django.urls import path
from .views import TestView, ISBNSearchView

app_name='books'

urlpatterns = [
    path('isbns', ISBNSearchView.as_view()),
]