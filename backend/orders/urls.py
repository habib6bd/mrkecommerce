from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminSummaryView,
    CartItemDetailView,
    CartView,
    OrderViewSet,
    WishlistViewSet,
)

router = DefaultRouter()
router.register("wishlist", WishlistViewSet, basename="wishlist")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("admin/summary/", AdminSummaryView.as_view(), name="admin-summary"),
] + router.urls
