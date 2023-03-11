from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import Bookcase
from .paginations import BookcasePagination
from .serializers import BookcaseSerializer

class ListCreateBookcaseAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookcaseSerializer
    queryset = Bookcase.objects.all()
    pagination_class = BookcasePagination

    def create(self, request, *args, **kwargs):
        serializer = BookcaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_bookcase = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_bookcase.id
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def get_queryset(self):
        return super().get_queryset()