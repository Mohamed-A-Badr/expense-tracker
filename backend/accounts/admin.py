from django.contrib import admin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_staff", "is_superuser")
    list_filter = ("is_staff", "is_superuser")
    search_fields = ("username", "email")
    readonly_fields = ("date_joined",)
