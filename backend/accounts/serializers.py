from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
            "email",
            "username",
            "password",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        email = attrs["email"]
        username = attrs["username"]
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("This Email already in use.")
        if CustomUser.objects.filter(username=username).exists():
            raise serializers.ValidationError("This Username already in use.")
        return super().validate(attrs)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        try:
            user = CustomUser.objects.create_user(**validated_data)
            user.set_password(password)
            user.save()
            return user
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
