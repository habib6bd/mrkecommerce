from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Category, Product

from .models import Cart, CartItem, Order, OrderItem, Wishlist
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CreateOrderSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    WishlistSerializer,
)


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        cart = self.get_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, pk):
        return get_object_or_404(CartItem, pk=pk, cart__user=request.user)

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class WishlistViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    filterset_fields = ["status"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action in ("update", "partial_update"):
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        qs = Order.objects.select_related("user").prefetch_related("items")
        if self.request.user.is_staff:
            return qs
        return qs.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(OrderSerializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        cart = Cart.objects.filter(user=request.user).first()
        items = list(cart.items.select_related("product")) if cart else []
        if not items:
            return Response(
                {"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST
            )

        shipping_serializer = CreateOrderSerializer(data=request.data)
        shipping_serializer.is_valid(raise_exception=True)
        shipping = shipping_serializer.validated_data

        with transaction.atomic():
            for item in items:
                product = item.product
                if product.stock < item.quantity:
                    return Response(
                        {"detail": f"Insufficient stock for {product.name}."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            subtotal = sum(
                (item.product.discount_price or item.product.price) * item.quantity
                for item in items
            )

            order = Order.objects.create(
                user=request.user,
                subtotal=subtotal,
                total=subtotal,
                **shipping,
            )

            for item in items:
                product = item.product
                unit_price = product.discount_price or product.price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    unit_price=unit_price,
                    quantity=item.quantity,
                )
                product.stock -= item.quantity
                product.sold_count += item.quantity
                product.save(update_fields=["stock", "sold_count"])

            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        orders = Order.objects.exclude(status=Order.Status.CANCELLED)
        revenue_total = orders.aggregate(total=Sum("total"))["total"] or 0

        return Response(
            {
                "product_count": Product.objects.count(),
                "active_product_count": Product.objects.filter(is_active=True).count(),
                "low_stock_count": Product.objects.filter(
                    is_active=True, stock__lte=5
                ).count(),
                "category_count": Category.objects.count(),
                "order_count": Order.objects.count(),
                "pending_order_count": Order.objects.filter(
                    status=Order.Status.PENDING
                ).count(),
                "revenue_total": revenue_total,
            }
        )
