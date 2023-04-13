from django.db.models import F
from rest_framework.filters import OrderingFilter

class CustomOrderingFilter(OrderingFilter):
    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)
        def make_f_object(x):
            return F(x[1:]).desc(nulls_last=True) if x[0] == '-' else F(x).asc(nulls_last=True)

        if ordering:
            ordering = map(make_f_object, ordering)
            return queryset.order_by(*ordering)

        return queryset