# path of this code : C:\Users\leo\pesticide\pesticide_project\api\models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class LimitConditionCode(models.Model):
    code = models.CharField(max_length=3, primary_key=True)
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

# 식품명 대뷴류 소분류를 위한 모델추가
class FoodCategory(models.Model):
    main_category = models.CharField(max_length=100)
    sub_category = models.CharField(max_length=100, null=True, blank=True)
    food_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'food_categories'
        indexes = [
            models.Index(fields=['food_name']),
            models.Index(fields=['main_category']),
            models.Index(fields=['sub_category']),
        ]

# 정부 공공데이터 API를 호출하여 농약성분 상세 데이터를 Database에 저장하기 위한 model 생성
class PesticideDetail(models.Model):
    reg_yn_nm = models.CharField(max_length=100)  # 등록여부
    use_pprtm = models.CharField(max_length=100)  # 사용시기
    prdlst_reg_no = models.CharField(max_length=100)  # 등록번호
    prdlst_reg_dt = models.CharField(max_length=8)  # 등록일자
    prdlst_reg_vald_dt = models.CharField(max_length=8)  # 등록유효일자
    mnf_incm_dvs_nm = models.CharField(max_length=100)  # 제조/수입구분
    persn_lvstck_toxcty = models.CharField(max_length=100)  # 독성
    use_tmno = models.CharField(max_length=100)  # 사용횟수
    cpr_nm = models.CharField(max_length=100)  # 법인명
    prdlst_kor_nm = models.CharField(max_length=200)  # 농약성분명(한글)
    prdlst_eng_nm = models.CharField(max_length=200)  # 농약성분명(영문)
    mdc_shap_nm = models.CharField(max_length=100)  # 제형
    sickns_hlsct_nm_weeds_nm = models.CharField(max_length=200)  # 병해충/잡초명
    brnd_nm = models.CharField(max_length=100)  # 상표명
    crops_nm = models.CharField(max_length=100)  # 작물명
    prpos_dvs_cd_nm = models.CharField(max_length=100)  # 용도구분
    dilu_drng = models.CharField(max_length=100)  # 희석배수
    eclgy_toxcty = models.CharField(max_length=100)  # 생태독성

    class Meta:
        indexes = [
            models.Index(fields=['prdlst_kor_nm']),
            models.Index(fields=['crops_nm']),
        ]

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