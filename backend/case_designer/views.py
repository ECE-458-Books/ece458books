import io
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import Bookcase, DisplayedBook
from .paginations import BookcasePagination
from .serializers import BookcaseSerializer
from rest_framework.views import APIView
from utils.permissions import CustomBasePermission
from django.http import FileResponse
from reportlab.pdfgen import canvas

class ListCreateBookcaseAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookcaseSerializer
    queryset = Bookcase.objects.all()
    pagination_class = BookcasePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['-last_edit_date']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        request.data["creator"] = request.user.id
        request.data["last_editor"] = request.user.id

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_bookcase = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_bookcase.id
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    # the default get_queryset is used for the list view of bookcases
    

class RetrieveUpdateDestroyBookcaseAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookcaseSerializer
    lookup_field = 'id'
    pagination_class = BookcasePagination

    def get_queryset(self):
        return Bookcase.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (bookcase,) = self.get_queryset()
        serializer = self.get_serializer(bookcase)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"error": "No bookcase with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None
    
    def update(self, request, *args, **kwargs):
        request.data['last_editor'] = request.user.id

        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (bookcase,) = self.get_queryset()
        serializer = self.get_serializer(bookcase, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # the default destroy method is used for deleting a bookcase

class PlanogramPDFView(APIView):
    permission_classes = [CustomBasePermission]

    def get(self, request, *args, **kwargs):
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 100, "Hello world.")
        p.showPage()
        p.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename="planogram.pdf")