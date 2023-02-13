from django.urls import path
from .views import ListCreatePurchaseOrderAPIView, RetrieveUpdateDestroyPurchaseOrderAPIView

app_name = 'purchase_orders'

urlpatterns = [
    path('', ListCreatePurchaseOrderAPIView.as_view()),
    path('/<id>', RetrieveUpdateDestroyPurchaseOrderAPIView.as_view())
]
