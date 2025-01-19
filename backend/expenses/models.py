from accounts.models import CustomUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.timezone import now


# Create your models here.
class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("Groceries", "Groceries"),
        ("Leisure", "Leisure"),
        ("Electronics", "Electronics"),
        ("Utilities", "Utilities"),
        ("Clothing", "Clothing"),
        ("Health", "Health"),
        ("Others", "Others"),
    ]
    title = models.CharField(max_length=100)
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField()
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="expenses"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
        ordering = ["-created_at", "-date"]

    def __str__(self):
        return f"{self.title} - {self.category}"

    def clean(self):
        if self.date > now().date():
            raise ValidationError("Date cannot be in the future")

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)
