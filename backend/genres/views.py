from django.db.models import Count

from rest_framework import filters
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import GenreSerializer
from .models import Genre
from .paginations import GenrePagination

class ListCreateGenreAPIView(ListCreateAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = GenrePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        queryset = queryset.annotate(
            real_book_cnt=Count('book')
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RetrieveUpdateDestroyGenreAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'id'