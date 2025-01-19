from django.test import TestCase
from .models import CustomUser
from rest_framework.test import APITestCase
from rest_framework.reverse import reverse
from rest_framework import status


# Create your tests here.
class CustomUserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = CustomUser.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword"
        )

    def test_user_object(self):
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertTrue(self.user.check_password("testpassword"))
        self.assertEqual(str(self.user), "testuser and test@example.com")


class RegisterLoginViewTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = CustomUser.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword"
        )

    def setUp(self):
        response = self.client.post(
            reverse("login"),
            data={"email": "test@example.com", "password": "testpassword"},
        )
        self.refresh_token = response.data["refresh"]

    def test_register_view(self):
        response = self.client.post(
            reverse("register"),
            data={
                "first_name": "new",
                "last_name": "user",
                "email": "user@mail.com",
                "username": "new-user",
                "password": "user123456",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json(), {"message": "User created successfully"})

    def test_login_view(self):
        response = self.client.post(
            reverse("login"),
            data={"email": "test@example.com", "password": "testpassword"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        response = self.client.post(
            reverse("token_refresh"),
            data={"refresh": self.refresh_token},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
