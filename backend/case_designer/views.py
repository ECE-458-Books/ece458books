from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import Bookcase, DisplayedBook
from .paginations import BookcasePagination
from .serializers import BookcaseSerializer

class ListCreateBookcaseAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookcaseSerializer
    queryset = Bookcase.objects.all()
    pagination_class = BookcasePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['last_edit_date']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        request.data["creator"] = request.user.id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_bookcase = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_bookcase.id
        return Response(response_data, status=status.HTTP_201_CREATED)