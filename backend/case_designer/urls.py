from django.urls import path

from .views import ListCreateBookcaseAPIView, RetrieveUpdateDestroyBookcaseAPIView

app_name = 'case_designer'

urlpatterns = [
    path('', ListCreateBookcaseAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBookcaseAPIView.as_view()),
]
