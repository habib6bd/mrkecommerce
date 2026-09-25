from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_creates_user(self):
        url = reverse("auth-register")
        payload = {
            "email": "jane@example.com",
            "name": "Jane Doe",
            "phone": "01700000000",
            "password": "StrongPass123!",
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="jane@example.com").exists())
        self.assertNotIn("password", response.data)

    def test_login_returns_jwt_tokens(self):
        User.objects.create_user(email="jane@example.com", password="StrongPass123!")
        url = reverse("auth-login")
        response = self.client.post(
            url, {"email": "jane@example.com", "password": "StrongPass123!"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_credentials_rejected(self):
        User.objects.create_user(email="jane@example.com", password="StrongPass123!")
        url = reverse("auth-login")
        response = self.client.post(
            url, {"email": "jane@example.com", "password": "wrong"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        url = reverse("auth-me")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_and_updates_profile(self):
        user = User.objects.create_user(
            email="jane@example.com", password="StrongPass123!", name="Jane"
        )
        self.client.force_authenticate(user=user)
        url = reverse("auth-me")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "jane@example.com")

        response = self.client.patch(url, {"name": "Jane Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.name, "Jane Updated")

    def test_me_exposes_is_staff_flag(self):
        user = User.objects.create_user(email="jane@example.com", password="StrongPass123!")
        admin = User.objects.create_superuser(email="admin@example.com", password="StrongPass123!")
        url = reverse("auth-me")

        self.client.force_authenticate(user=user)
        response = self.client.get(url)
        self.assertFalse(response.data["is_staff"])

        self.client.force_authenticate(user=admin)
        response = self.client.get(url)
        self.assertTrue(response.data["is_staff"])

    def test_cannot_set_is_staff_via_update_profile(self):
        user = User.objects.create_user(email="jane@example.com", password="StrongPass123!")
        self.client.force_authenticate(user=user)
        url = reverse("auth-me")
        response = self.client.patch(url, {"is_staff": True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertFalse(user.is_staff)
