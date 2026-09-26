from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Wishlist


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "updated_at"]
    search_fields = ["user__email"]
    inlines = [CartItemInline]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ["user", "product", "added_at"]
    list_filter = ["added_at"]
    search_fields = ["user__email", "product__name"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "product_name", "unit_price", "quantity"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "status", "payment_method", "total", "created_at"]
    list_filter = ["status", "payment_method", "created_at"]
    search_fields = ["user__email", "full_name", "phone"]
    inlines = [OrderItemInline]
