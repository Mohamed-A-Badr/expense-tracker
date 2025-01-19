from django.urls import path

from . import views

urlpatterns = [
    path("", views.expense_list_create, name="expense_list"),
    path("<int:pk>", views.expense_detail_admin, name="expense_detail_admin"),
    path("user/", views.user_expense_list, name="user_expense_list"),
    path("user/<int:pk>/", views.expense_detail_user, name="user_expense_list"),
]
