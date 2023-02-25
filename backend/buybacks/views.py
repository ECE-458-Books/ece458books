from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .paginations import BuybackPagination
from .models import Buyback, BuybackOrder
from .serializers import BuybackOrderSerializer, BuybackSerializer
from django.db.models import Sum
from books.models import Book


class ListCreateBuybackAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BuybackOrderSerializer
    queryset = BuybackOrder.objects.all()
    pagination_class = BuybackPagination
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        serializer = BuybackOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        saved_buyback_order = serializer.save()

        response_data = serializer.data
        response_data['id'] = saved_buyback_order.id
        return Response(response_data, status=status.HTTP_201_CREATED)


class RetrieveUpdateDestroyBuybackAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BuybackOrderSerializer
    lookup_field = 'id'
    pagination_class = BuybackPagination

    def get_queryset(self):
        return BuybackOrder.objects.filter(id=self.kwargs['id'])

    def retrieve(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        (buyback_order,) = self.get_queryset()
        serializer = self.get_serializer(buyback_order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        invalid_id_response = self.verify_existance()
        if invalid_id_response:
            return invalid_id_response
        partial = kwargs.pop('partial', False)
        (buyback_order,) = self.get_queryset()
        serializer = self.get_serializer(buyback_order, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def verify_existance(self):
        if (len(self.get_queryset()) == 0):
            return Response({"id": "No buyback order with queried id."}, status=status.HTTP_400_BAD_REQUEST)
        return None

    def destroy(self, request, *args, **kwargs):
        buyback_book_quantities = Buyback.objects.filter(buyback_order=self.get_object().id).values('book').annotate(num_books=Sum('quantity')).values('book', 'num_books')
        for buyback_book_quantity in buyback_book_quantities:
            book_to_remove_buyback = Book.objects.filter(id=buyback_book_quantity['book']).get()
            book_to_remove_buyback.stock += buyback_book_quantity['num_books']
            book_to_remove_buyback.save()
        return super().destroy(request, *args, **kwargs)
