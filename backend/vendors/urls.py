from django.urls import path
from .views import ListCreateVendorAPIView, RetrieveUpdateDestroyVendorAPIView

app_name='vendors'

urlpatterns = [
    path('', ListCreateVendorAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyVendorAPIView.as_view()),
]