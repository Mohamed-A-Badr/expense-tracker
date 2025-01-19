from django.urls import path

from . import views

urlpatterns = [
    path("", views.expense_list_create, name="expense_list"),
    path("user/", views.user_expense_list, name="user_expense_list"),
]
