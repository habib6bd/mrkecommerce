import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    min_price = django_filters.NumberFilter(method="filter_min_price")
    max_price = django_filters.NumberFilter(method="filter_max_price")

    class Meta:
        model = Product
        fields = ["category", "is_featured"]

    def _effective_price(self):
        from django.db.models import Case, F, When

        return Case(
            When(discount_price__isnull=False, then=F("discount_price")),
            default=F("price"),
        )

    def _with_effective_price(self, queryset):
        if "effective_price" in queryset.query.annotations:
            return queryset
        return queryset.alias(effective_price=self._effective_price())

    def filter_min_price(self, queryset, name, value):
        return self._with_effective_price(queryset).filter(effective_price__gte=value)

    def filter_max_price(self, queryset, name, value):
        return self._with_effective_price(queryset).filter(effective_price__lte=value)
