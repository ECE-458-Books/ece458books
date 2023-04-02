from django.urls import path

from .views import ListCreateBookcaseAPIView, RetrieveUpdateDestroyBookcaseAPIView, PlanogramPDFView

app_name = 'case_designer'

urlpatterns = [
    path('', ListCreateBookcaseAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyBookcaseAPIView.as_view()),
    path('/planogram/<id>', PlanogramPDFView.as_view()),
]
