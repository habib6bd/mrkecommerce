from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product, ProductImage

User = get_user_model()


class ProductTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Shoes", slug="shoes")
        self.other_category = Category.objects.create(name="Bags", slug="bags")
        self.product1 = Product.objects.create(
            name="Running Shoes",
            slug="running-shoes",
            category=self.category,
            price=1000,
            discount_price=800,
            stock=10,
            is_featured=True,
        )
        self.product2 = Product.objects.create(
            name="Leather Bag",
            slug="leather-bag",
            category=self.other_category,
            price=2000,
            stock=5,
        )

    def test_list_products(self):
        url = reverse("product-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_filter_by_category(self):
        url = reverse("product-list")
        response = self.client.get(url, {"category": "shoes"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "running-shoes")

    def test_filter_by_price_range(self):
        url = reverse("product-list")
        response = self.client.get(url, {"min_price": 1500, "max_price": 2500})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "leather-bag")

    def test_search_products(self):
        url = reverse("product-list")
        response = self.client.get(url, {"search": "Running"})
        self.assertEqual(response.data["count"], 1)

    def test_detail_by_slug(self):
        url = reverse("product-detail", args=["running-shoes"])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Running Shoes")

    def test_featured_endpoint(self):
        url = reverse("product-featured")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [p["slug"] for p in response.data["results"]]
        self.assertIn("running-shoes", slugs)
        self.assertNotIn("leather-bag", slugs)

    def test_non_admin_cannot_create_product(self):
        user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=user)
        url = reverse("product-list")
        response = self.client.post(
            url,
            {
                "name": "New",
                "category": self.category.id,
                "price": 100,
                "stock": 1,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_product(self):
        admin = User.objects.create_superuser(
            email="admin@example.com", password="pass12345"
        )
        self.client.force_authenticate(user=admin)
        url = reverse("product-list")
        response = self.client.post(
            url,
            {
                "name": "New Product",
                "category": self.category.id,
                "price": 100,
                "stock": 1,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Product.objects.filter(name="New Product").exists())

    def test_inactive_product_hidden_from_public(self):
        Product.objects.create(
            name="Discontinued",
            slug="discontinued",
            category=self.category,
            price=100,
            stock=0,
            is_active=False,
        )
        response = self.client.get(reverse("product-list"))
        slugs = [p["slug"] for p in response.data["results"]]
        self.assertNotIn("discontinued", slugs)

        response = self.client.get(reverse("product-detail", args=["discontinued"]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_see_and_manage_inactive_product(self):
        admin = User.objects.create_superuser(
            email="admin@example.com", password="pass12345"
        )
        Product.objects.create(
            name="Discontinued",
            slug="discontinued",
            category=self.category,
            price=100,
            stock=0,
            is_active=False,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.get(reverse("product-list"))
        slugs = [p["slug"] for p in response.data["results"]]
        self.assertIn("discontinued", slugs)

        response = self.client.get(reverse("product-detail", args=["discontinued"]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(
            reverse("product-detail", args=["discontinued"]), {"is_active": True}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ProductImageTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Running Shoes",
            slug="running-shoes",
            category=self.category,
            price=1000,
            stock=10,
        )
        self.admin = User.objects.create_superuser(
            email="admin@example.com", password="pass12345"
        )

    def test_non_admin_cannot_add_image(self):
        user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=user)
        response = self.client.post(
            reverse("product-image-list"),
            {"product": self.product.slug, "image": "/images/shoes-2.jpg"},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_add_and_remove_image(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("product-image-list"),
            {"product": self.product.slug, "image": "/images/shoes-2.jpg", "order": 1},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        image_id = response.data["id"]
        self.assertEqual(ProductImage.objects.filter(product=self.product).count(), 1)

        detail = self.client.get(reverse("product-detail", args=["running-shoes"]))
        self.assertEqual(len(detail.data["images"]), 1)

        response = self.client.delete(reverse("product-image-detail", args=[image_id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductImage.objects.filter(product=self.product).count(), 0)


class CategoryTests(APITestCase):
    def test_list_and_detail(self):
        parent = Category.objects.create(name="Shoes", slug="shoes")
        Category.objects.create(name="Sneakers", slug="sneakers", parent=parent)

        list_url = reverse("category-list")
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(len(response.data[0]["subcategories"]), 1)

        detail_url = reverse("category-detail", args=["shoes"])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Shoes")

    def test_admin_can_manage_subcategory_directly(self):
        parent = Category.objects.create(name="Shoes", slug="shoes")
        Category.objects.create(name="Sneakers", slug="sneakers", parent=parent)
        admin = User.objects.create_superuser(email="admin@example.com", password="pass12345")
        self.client.force_authenticate(user=admin)

        detail_url = reverse("category-detail", args=["sneakers"])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Sneakers")

        response = self.client.patch(detail_url, {"name": "Running Sneakers"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(slug="sneakers").exists())

    def test_admin_can_create_category(self):
        admin = User.objects.create_superuser(email="admin@example.com", password="pass12345")
        self.client.force_authenticate(user=admin)
        response = self.client.post(
            reverse("category-list"), {"name": "New Category", "slug": "new-category"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Category.objects.filter(slug="new-category").exists())

    def test_non_admin_cannot_create_category(self):
        user = User.objects.create_user(email="user@example.com", password="pass12345")
        self.client.force_authenticate(user=user)
        response = self.client.post(
            reverse("category-list"), {"name": "New Category", "slug": "new-category"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
