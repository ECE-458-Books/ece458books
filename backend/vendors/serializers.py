from rest_framework import serializers

from .models import Vendor

from purchase_orders.models import PurchaseOrder

class VendorSerializer(serializers.ModelSerializer):
    num_purchase_orders = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = '__all__'
        # fields = ['id', 'name', 'num_purchase_orders']
    
    def get_num_purchase_orders(self, instance):
        return len(PurchaseOrder.objects.filter(vendor=instance.id))