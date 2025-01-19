from rest_framework import generics, permissions

from .models import Expense
from .serializers import ExpenseListCreateSerializer, ExpenseDetailSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseListCreateSerializer

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

    def get_queryset(self):
        return Expense.objects.select_related("user").filter(user=self.request.user)


user_expense_list = ExpenseUserListView.as_view()
