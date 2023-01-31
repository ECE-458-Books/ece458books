from rest_framework.permissions import IsAuthenticated
from .serializers import SalesReconciliationSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import SalesReconciliation
from rest_framework.generics import ListCreateAPIView


class SalesReconciliationAPIView(ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SalesReconciliationSerializer
    queryset = SalesReconciliation.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = SalesReconciliationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
