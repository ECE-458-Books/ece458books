from rest_framework import serializers

from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    # Uncomment when purchase_order app is made
    # purchase_orders = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = '__all__'