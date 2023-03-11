from django.urls import path

from .views import ListCreateBookcaseAPIView

app_name = 'case_designer'

urlpatterns = [
    path('', ListCreateBookcaseAPIView.as_view()),
]
