from django.db.models import Count, Q

from rest_framework import filters, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import GenreSerializer
from .models import Genre
from .paginations import GenrePagination

from books.models import Book
from utils.permissions import CustomBasePermission

class ListCreateGenreAPIView(ListCreateAPIView):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()
    permission_classes = [CustomBasePermission]
    pagination_class = GenrePagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)
    
    def filter_queryset(self, request, queryset):
        """Override the filter_queryset to add custom ordering for annotated fields

        Note* This can be a feature to add to DRF (Django Rest Framework)
        so that the queryset can be filtered by annotated fields

        """
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, self)

        ordering = self.request.GET.get("ordering", None)

        if ordering == 'book_cnt':
            queryset = queryset.annotate(
                book_cnt=Count('book')
            ).order_by('book_cnt')
        elif ordering == '-book_cnt':
            queryset = queryset.annotate(
                book_cnt=Count('book')
            ).order_by('-book_cnt')
        
        return queryset


    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(request, self.get_queryset())

        # https://docs.djangoproject.com/en/4.1/topics/db/aggregation/#filtering-on-annotations
        queryset = queryset.annotate(
            book_cnt=Count('book', filter=Q(book__isGhost=False))
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
    permission_classes = [CustomBasePermission]
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
            return Response(error_msg, status=status.HTTP_409_CONFLICT)

        # Perform destroy of instance
        self.perform_destroy(instance)
        return Response({"destroy": "success"}, status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        request.data['name'] = request.data['name'].strip().lower()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)