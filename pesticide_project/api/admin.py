# pesticide_project/api/admin.py
from django.contrib import admin
from .models import PesticideLimit, LimitConditionCode, SearchLog

@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'ip_address', 'pesticide_term', 'food_term', 'results_count')
    list_filter = ('timestamp', 'results_count')
    search_fields = ('search_term', 'pesticide_term', 'food_term', 'ip_address')
    readonly_fields = ('timestamp', 'ip_address', 'user_agent')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'  # 날짜 기반 네비게이션 추가

@admin.register(PesticideLimit)
class PesticideLimitAdmin(admin.ModelAdmin):
    list_display = ('pesticide_name_kr', 'pesticide_name_en', 'food_name', 'max_residue_limit')
    search_fields = ('pesticide_name_kr', 'pesticide_name_en', 'food_name')
    list_filter = ('condition_code',)

@admin.register(LimitConditionCode)
class LimitConditionCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'description')