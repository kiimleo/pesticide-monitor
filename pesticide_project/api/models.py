from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class LimitConditionCode(models.Model):
    code = models.CharField(max_length=2, primary_key=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'limit_condition_codes'
        verbose_name = '제한조건 코드'
        verbose_name_plural = '제한조건 코드'

    def __str__(self):
        return f"{self.code}: {self.description}"


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
        verbose_name = '농약 잔류허용기준'
        verbose_name_plural = '농약 잔류허용기준'
        indexes = [
            models.Index(fields=['pesticide_name_kr']),
            models.Index(fields=['pesticide_name_en']),
            models.Index(fields=['food_name']),
        ]

    def __str__(self):
        return f"{self.pesticide_name_kr} - {self.food_name} ({self.max_residue_limit})"


class SearchLog(models.Model):
    search_term = models.CharField(max_length=200)  # 통합 검색어
    pesticide_term = models.CharField(max_length=100, null=True, blank=True)  # 농약명 검색어
    food_term = models.CharField(max_length=100, null=True, blank=True)      # 식품명 검색어
    timestamp = models.DateTimeField(auto_now_add=True)  # 검색 시간
    ip_address = models.GenericIPAddressField(null=True)  # 사용자 IP
    user_agent = models.TextField(null=True)  # 브라우저 정보
    results_count = models.IntegerField(default=0)  # 검색 결과 수

    class Meta:
        db_table = 'search_logs'
        ordering = ['-timestamp']  # 최신 검색이 먼저 나오도록
        verbose_name = '검색 로그'
        verbose_name_plural = '검색 로그'

    def __str__(self):
        return f"{self.search_term} ({self.results_count} results) - {self.timestamp}"


class User(AbstractUser):
    email = models.EmailField(unique=True)
    organization = models.CharField(max_length=100)  # 소속기관명 또는 이름 (필수)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

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
        verbose_name = '사용자'
        verbose_name_plural = '사용자'

    def __str__(self):
        return f"{self.email} ({self.organization})"

    def save(self, *args, **kwargs):
        if not self.pk:  # 새로운 객체인 경우
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)