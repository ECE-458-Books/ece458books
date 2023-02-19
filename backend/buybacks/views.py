from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .paginations import BuybackPagination


class ListCreateBuybackAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = BuybackPagination

    def paginate_queryset(self, queryset):
        if 'no_pagination' in self.request.query_params:
            return None
        else:
            return super().paginate_queryset(queryset)

    def create(self, request, *args, **kwargs):
        return Response(
            {
                "id": 86,
                "date": "2022-12-01",
                "buybacks": [{
                    "id": 118,
                    "book": 104,
                    "book_title": "The Google Story",
                    "quantity": 10,
                    "unit_buyback_price": 10.01
                }, {
                    "id": 119,
                    "book": 105,
                    "book_title": "Moby Dick",
                    "quantity": 10,
                    "unit_buyback_price": 10.0,
                    "subtotal": 100.0
                }, {
                    "id": 120,
                    "book": 106,
                    "book_title": "The Catcher in the Rye",
                    "quantity": 1,
                    "unit_buyback_price": 2.0
                }, {
                    "id": 124,
                    "book": 107,
                    "book_title": "Harry Potter and the Sorcerer's Stone",
                    "quantity": 1,
                    "unit_buyback_price": 200.0
                }],
                "vendor": 49,
                "vendor_name": "Adams Publishing",
                "num_books": 22,
                "num_unique_books": 4
            },
            status=status.HTTP_200_OK)


class RetrieveUpdateDestroyBuybackAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = BuybackPagination

    def retrieve(self, request, *args, **kwargs):
        return Response(
            {
                "id": 127,
                "date": "2022-12-02",
                "buybacks": [{
                    "id": 309,
                    "book": 104,
                    "book_title": "The Google Story",
                    "quantity": 5,
                    "unit_buyback_price": 20.0
                }, {
                    "id": 310,
                    "book": 105,
                    "book_title": "Moby Dick",
                    "quantity": 4,
                    "unit_buyback_price": 15.0
                }],
                "num_books": 9,
                "num_unique_books": 2,
                "vendor": 49,
                "vendor_name": "Adams Publishing"
            },
            status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        return Response(
            {
                "id": 127,
                "date": "2022-12-02",
                "buybacks": [{
                    "id": 309,
                    "book": 104,
                    "book_title": "The Google Story",
                    "quantity": 5,
                    "unit_buyback_price": 20.0
                }, {
                    "id": 310,
                    "book": 105,
                    "book_title": "Moby Dick",
                    "quantity": 4,
                    "unit_buyback_price": 15.0
                }],
                "num_books": 9,
                "num_unique_books": 2
            },
            status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_204_NO_CONTENT)
