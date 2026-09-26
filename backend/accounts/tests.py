from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        # Auth endpoints are throttled (scope "auth"); the throttle cache isn't
        # reset between tests by Django's test runner, so clear it explicitly to
        # keep these tests independent of how many other tests ran first.
        cache.clear()

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

    def test_auth_endpoints_are_throttled(self):
        url = reverse("auth-login")
        for _ in range(10):
            self.client.post(url, {"email": "nobody@example.com", "password": "wrong"})
        response = self.client.post(url, {"email": "nobody@example.com", "password": "wrong"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class LogoutTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(email="jane@example.com", password="StrongPass123!")

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse("auth-logout"), {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        self.client.force_authenticate(user=None)
        refresh_response = self.client.post(reverse("auth-refresh"), {"refresh": str(refresh)})
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post(reverse("auth-logout"), {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_rejects_invalid_token(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("auth-logout"), {"refresh": "garbage"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AddressTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="jane@example.com", password="StrongPass123!")
        self.other_user = User.objects.create_user(email="other@example.com", password="StrongPass123!")
        self.client.force_authenticate(user=self.user)
        self.payload = {
            "full_name": "Jane Doe",
            "phone": "01700000000",
            "line1": "123 Main St",
            "city": "Dhaka",
            "is_default": True,
        }

    def test_create_and_list_address(self):
        response = self.client.post(reverse("address-list"), self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get(reverse("address-list"))
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["full_name"], "Jane Doe")

    def test_update_and_delete_address(self):
        create_response = self.client.post(reverse("address-list"), self.payload)
        address_id = create_response.data["id"]

        response = self.client.patch(reverse("address-detail", args=[address_id]), {"city": "Chittagong"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["city"], "Chittagong")

        response = self.client.delete(reverse("address-detail", args=[address_id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Address.objects.filter(user=self.user).count(), 0)

    def test_cannot_see_or_modify_other_users_address(self):
        other_address = Address.objects.create(user=self.other_user, **self.payload)

        response = self.client.get(reverse("address-list"))
        self.assertEqual(len(response.data), 0)

        response = self.client.patch(reverse("address-detail", args=[other_address.id]), {"city": "Sylhet"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_addresses_require_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("address-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            email="jane@example.com", password="OldPass123!", name="Jane"
        )

    def test_request_reset_sends_email_for_existing_user(self):
        response = self.client.post(reverse("auth-password-reset"), {"email": "jane@example.com"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("jane@example.com", mail.outbox[0].to)
        self.assertIn("reset-password?uid=", mail.outbox[0].body)

    def test_request_reset_is_silent_for_unknown_email(self):
        response = self.client.post(
            reverse("auth-password-reset"), {"email": "nobody@example.com"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_confirm_reset_with_valid_token_changes_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "BrandNewPass456!"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass456!"))
        self.assertFalse(self.user.check_password("OldPass123!"))

    def test_confirm_reset_with_invalid_token_rejected(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": "bad-token", "new_password": "BrandNewPass456!"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OldPass123!"))

    def test_confirm_reset_token_cannot_be_reused(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        first = self.client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "BrandNewPass456!"},
        )
        self.assertEqual(first.status_code, status.HTTP_200_OK)

        second = self.client.post(
            reverse("auth-password-reset-confirm"),
            {"uid": uid, "token": token, "new_password": "AnotherPass789!"},
        )
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
