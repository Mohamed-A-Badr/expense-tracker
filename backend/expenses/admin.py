from django.contrib import admin

from .models import Expense

# Register your models here.


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "amount",
        "date",
        "user__username",
    )
    list_filter = (
        "category",
        "date",
    )
    search_fields = (
        "user__email",
        "category",
    )
