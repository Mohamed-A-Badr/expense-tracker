from django.urls import path

from . import views

urlpatterns = [
    path("signup/", views.register_new_user, name="register_new_user"),
]
