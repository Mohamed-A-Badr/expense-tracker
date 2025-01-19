from rest_framework import generics

from .serializers import RegisterSerializer
from .models import CustomUser


# Create your views here.
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "User created successfully",
        }
        return response


register_new_user = RegisterView.as_view()
