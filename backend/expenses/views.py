from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions

from .filters import ExpenseFilter
from .models import Expense
from .serializers import (
    ExpenseDetailAdminSerializer,
    ExpenseDetailSerializer,
    ExpenseListCreateSerializer,
)


class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseListCreateSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ExpenseFilter

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {"message": "This expense added successfully"}
        return response


expense_list_create = ExpenseListCreateView.as_view()


class ExpenseUserListView(generics.ListAPIView):
    serializer_class = ExpenseListCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ExpenseFilter

    def get_queryset(self):
        return Expense.objects.select_related("user").filter(user=self.request.user)


user_expense_list = ExpenseUserListView.as_view()


class ExpenseDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseDetailAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "pk"


expense_detail_admin = ExpenseDetailAdminView.as_view()


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        return Expense.objects.select_related("user").filter(user=self.request.user)


expense_detail_user = ExpenseDetailView.as_view()
