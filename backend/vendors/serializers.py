from rest_framework import serializers

from .models import Vendor

from purchase_orders.models import PurchaseOrder

class VendorSerializer(serializers.ModelSerializer):
    num_purchase_orders = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vendor
        fields = ['id', 'name', 'num_purchase_orders']