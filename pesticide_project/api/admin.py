# api/admin.py
from django.contrib import admin
from .models import SearchLog

@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ('search_term', 'pesticide_term', 'food_term', 'results_count', 'timestamp', 'ip_address')
    list_filter = ('timestamp', 'results_count')
    search_fields = ('search_term', 'pesticide_term', 'food_term')
    date_hierarchy = 'timestamp'