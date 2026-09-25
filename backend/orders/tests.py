from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product

from .models import Order

User = get_user_model()


class CartTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=self.user)
        category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Running Shoes",
            slug="running-shoes",
            category=category,
            price=1000,
            discount_price=800,
            stock=10,
        )

    def test_add_item_to_cart(self):
        url = reverse("cart")
        response = self.client.post(url, {"product_id": self.product.id, "quantity": 2})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 2)
        self.assertEqual(response.data["total"], 1600)

    def test_add_same_item_increments_quantity(self):
        url = reverse("cart")
        self.client.post(url, {"product_id": self.product.id, "quantity": 1})
        response = self.client.post(url, {"product_id": self.product.id, "quantity": 2})
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 3)

    def test_update_and_remove_cart_item(self):
        cart_url = reverse("cart")
        response = self.client.post(cart_url, {"product_id": self.product.id, "quantity": 1})
        item_id = response.data["items"][0]["id"]

        item_url = reverse("cart-item-detail", args=[item_id])
        response = self.client.patch(item_url, {"quantity": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["items"][0]["quantity"], 5)

        response = self.client.delete(item_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 0)

    def test_cart_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WishlistTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=self.user)
        category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Running Shoes", slug="running-shoes", category=category, price=1000, stock=10
        )

    def test_add_and_list_wishlist(self):
        url = reverse("wishlist-list")
        response = self.client.post(url, {"product_id": self.product.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)

    def test_remove_from_wishlist(self):
        url = reverse("wishlist-list")
        response = self.client.post(url, {"product_id": self.product.id})
        wishlist_id = response.data["id"]

        detail_url = reverse("wishlist-detail", args=[wishlist_id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class OrderCreationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=self.user)
        category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Running Shoes",
            slug="running-shoes",
            category=category,
            price=1000,
            discount_price=800,
            stock=3,
        )
        self.shipping = {
            "full_name": "Jane Doe",
            "phone": "01700000000",
            "address_line1": "123 Main St",
            "city": "Dhaka",
        }

    def test_create_order_from_cart_reduces_stock(self):
        self.client.post(reverse("cart"), {"product_id": self.product.id, "quantity": 2})

        response = self.client.post(reverse("order-list"), self.shipping)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["total"], "1600.00")
        self.assertEqual(len(response.data["items"]), 1)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)
        self.assertEqual(self.product.sold_count, 2)

        order = Order.objects.get()
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.payment_method, Order.PaymentMethod.CASH_ON_DELIVERY)

    def test_cart_is_cleared_after_order(self):
        self.client.post(reverse("cart"), {"product_id": self.product.id, "quantity": 1})
        self.client.post(reverse("order-list"), self.shipping)

        cart_response = self.client.get(reverse("cart"))
        self.assertEqual(len(cart_response.data["items"]), 0)

    def test_cannot_order_more_than_stock(self):
        self.client.post(reverse("cart"), {"product_id": self.product.id, "quantity": 10})
        response = self.client.post(reverse("order-list"), self.shipping)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

    def test_cannot_order_with_empty_cart(self):
        response = self.client.post(reverse("order-list"), self.shipping)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_my_orders(self):
        self.client.post(reverse("cart"), {"product_id": self.product.id, "quantity": 1})
        self.client.post(reverse("order-list"), self.shipping)

        response = self.client.get(reverse("order-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_order_detail(self):
        self.client.post(reverse("cart"), {"product_id": self.product.id, "quantity": 1})
        create_response = self.client.post(reverse("order-list"), self.shipping)
        order_id = create_response.data["id"]

        response = self.client.get(reverse("order-detail", args=[order_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], order_id)
