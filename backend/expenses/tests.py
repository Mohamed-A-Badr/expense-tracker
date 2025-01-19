from datetime import date

from accounts.models import CustomUser
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from .models import Expense


class ExpenseTest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            is_staff=True,
            is_superuser=True,
        )
        response = self.client.post(
            reverse("login"),
            {
                "email": "test@example.com",
                "password": "testpassword",
            },
        )
        self.access_token = response.data["access"]
        self.header = {"Authorization": f"Bearer {self.access_token}"}

    def test_expense_list(self):
        response = self.client.get(
            reverse("expense_list"),
            headers=self.header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expense_list_create(self):
        data = {
            "title": "Test Expense",
            "amount": 100.0,
            "category": "Groceries",
            "date": date(2025, 1, 1),
        }
        response = self.client.post(reverse("expense_list"), data, headers=self.header)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_expense_detail(self):
        expense = Expense.objects.create(
            title="Test Expense",
            amount=100.0,
            category="Groceries",
            date=date(2025, 1, 1),
            user=self.user,
        )
        response = self.client.get(
            reverse("expense_detail_admin", kwargs={"pk": expense.id}),
            headers=self.header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expense_update(self):
        expense = Expense.objects.create(
            title="Test Expense",
            amount=100.0,
            category="Groceries",
            date=date(2025, 1, 1),
            user=self.user,
        )
        data = {
            "title": "Updated Expense",
            "amount": 200.0,
            "category": "Leisure",
            "date": date(2025, 1, 1),
        }
        response = self.client.patch(
            reverse("expense_detail_admin", kwargs={"pk": expense.id}),
            data,
            headers=self.header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_expense_delete(self):
        expense = Expense.objects.create(
            title="Test Expense",
            amount=100.0,
            category="Groceries",
            date=date(2025, 1, 1),
            user=self.user,
        )
        response = self.client.delete(
            reverse("expense_detail_admin", kwargs={"pk": expense.id}),
            headers=self.header,
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
