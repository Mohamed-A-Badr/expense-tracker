from rest_framework import serializers

from .models import Expense


class ExpenseListCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Expense
        fields = (
            "title",
            "category",
            "amount",
            "date",
            "username",
        )

    def save(self, **kwargs):
        self.validated_data["user"] = self.context["request"].user
        return super().save(**kwargs)
