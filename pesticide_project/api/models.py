from django.db import models
from django.contrib.auth.models import AbstractUser


class LimitConditionCode(models.Model):
    code = models.CharField(max_length=2, primary_key=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'limit_condition_codes'


class PesticideLimit(models.Model):
    pesticide_name_kr = models.CharField(max_length=100)
    pesticide_name_en = models.CharField(max_length=100)
    food_name = models.CharField(max_length=100)
    max_residue_limit = models.DecimalField(max_digits=10, decimal_places=3)
    condition_code = models.ForeignKey(
        LimitConditionCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='condition_code'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pesticide_limits'


class User(AbstractUser):
    email = models.EmailField(unique=True)
    organization = models.CharField(max_length=100)  # 소속기관명 또는 이름 (필수)

    # related_name 추가하여 충돌 해결
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['organization', 'username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.email} ({self.organization})"