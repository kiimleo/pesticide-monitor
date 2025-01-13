# pesticide_project/api/admin.py
from django.contrib import admin
from .models import PesticideLimit, LimitConditionCode, SearchLog

@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ('search_term', 'pesticide_term', 'food_term', 'results_count', 'timestamp', 'ip_address')
    list_filter = ('timestamp', 'results_count')
    search_fields = ('search_term', 'pesticide_term', 'food_term')
    date_hierarchy = 'timestamp'

@admin.register(PesticideLimit)
class PesticideLimitAdmin(admin.ModelAdmin):
    list_display = ('pesticide_name_kr', 'pesticide_name_en', 'food_name', 'max_residue_limit')
    search_fields = ('pesticide_name_kr', 'pesticide_name_en', 'food_name')
    list_filter = ('condition_code',)

@admin.register(LimitConditionCode)
class LimitConditionCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'description')