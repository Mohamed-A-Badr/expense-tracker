import django_filters
from django.utils.timezone import now
from datetime import timedelta
from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    category = django_filters.CharFilter(field_name="category", lookup_expr="iexact")
    last_n_days = django_filters.NumberFilter(method="filter_last_n_days")

    class Meta:
        model = Expense
        fields = ["category", "start_date", "end_date", "last_n_days"]

    def filter_last_n_days(self, queryset, name, value: int):
        if value:
            nubmer_of_days = now().date() - timedelta(days=int(value))
            return queryset.filter(date__gte=nubmer_of_days)
        return queryset
