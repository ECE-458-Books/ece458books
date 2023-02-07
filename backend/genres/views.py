from django.db.models import Count

from rest_framework import filters, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import GenreSerializer
from .models import Genre
from .paginations import GenrePagination

from books.models import Book

class ListCreateGenreAPIView(ListCreateAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = GenrePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Might not scale?
        queryset = queryset.annotate(
            book_cnt=Count('book')
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

    def destroy(self, request, *args, **kwargs):
        
        # Check if the request url is valid
        try:
            instance = self.get_object()
        except Exception as e:
            return Response({"error": f"{e}"}, status=status.HTTP_204_NO_CONTENT)
        
        # Check to see if the Genre has no books associated
        associated_book_cnt = len(instance.book_set.all())
        if(associated_book_cnt != 0):
            error_msg = {"error": f"{associated_book_cnt} book(s) associated with genre:{instance.name}"}
            return Response(error_msg, status=status.HTTP_400_BAD_REQUEST)

        self.perform_destroy(instance)
        return Response({"destroy": "success"}, status=status.HTTP_204_NO_CONTENT)