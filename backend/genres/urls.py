from django.urls import path
from .views import ListCreateGenreAPIView

app_name='genres'

urlpatterns = [
    path('', ListCreateGenreAPIView.as_view()),
]