from rest_framework import serializers
from collections import OrderedDict

from .models import Vendor

from purchase_orders.models import PurchaseOrder

class VendorSerializer(serializers.ModelSerializer):
    num_purchase_orders = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vendor
        fields = ['id', 'name', 'num_purchase_orders', 'buyback_rate']
    
    def to_representation(self, instance):
        result = super(VendorSerializer, self).to_representation(instance)
        return OrderedDict([(key, result[key]) for key in result if result[key] is not None])