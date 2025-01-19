from rest_framework import serializers

from .models import Expense


class ExpenseListCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Expense
        fields = (
            "id",
            "title",
            "category",
            "amount",
            "date",
            "username",
        )

    def save(self, **kwargs):
        self.validated_data["user"] = self.context["request"].user
        return super().save(**kwargs)


class ExpenseDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = (
            "id",
            "title",
            "category",
            "amount",
            "date",
        )


class ExpenseDetailAdminSerializer(ExpenseDetailSerializer):
    class Meta(ExpenseDetailSerializer.Meta):
        fields = ExpenseDetailSerializer.Meta.fields + ("user",)
