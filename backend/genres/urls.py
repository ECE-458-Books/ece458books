from django.urls import path
from .views import ListCreateGenreAPIView, RetrieveUpdateDestroyGenreAPIView

app_name='genres'

urlpatterns = [
    path('', ListCreateGenreAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyGenreAPIView.as_view()),
]