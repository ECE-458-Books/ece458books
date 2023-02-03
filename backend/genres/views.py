from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_fraemwork.permissions import IsAuthenticated

from .serializers import GenreSerializer
from .models import Genre

class ListCreateGenreAPIView(ListCreateAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
    permission_classes = [IsAuthenticated]