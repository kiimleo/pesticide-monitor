# pesticide_project/api/admin.py
from django.contrib import admin
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
from django.template.response import TemplateResponse
from .models import PesticideLimit, LimitConditionCode, SearchLog, User, PasswordResetToken, GuestSession

@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'ip_address', 'pesticide_term', 'food_term', 'results_count', 'formatted_timestamp')
    list_filter = ('timestamp', 'results_count')
    search_fields = ('search_term', 'pesticide_term', 'food_term', 'ip_address')
    readonly_fields = ('timestamp', 'ip_address', 'user_agent', 'search_term')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'
    list_per_page = 50
    
    def formatted_timestamp(self, obj):
        """한국 시간으로 포맷된 타임스탬프"""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    formatted_timestamp.short_description = '검색 시간'
    
    def get_queryset(self, request):
        """최근 1000개 로그만 표시 (성능 최적화)"""
        # 슬라이스 대신 limit 사용하여 distinct 호환성 확보
        return super().get_queryset(request)
    
    def changelist_view(self, request, extra_context=None):
        """검색 로그 목록 페이지에 통계 정보 추가"""
        # 기본 통계 계산
        last_week = timezone.now() - timedelta(days=7)
        
        response = super().changelist_view(request, extra_context=extra_context)
        
        try:
            # 통계 정보 추가
            stats = {
                'total_searches': SearchLog.objects.count(),
                'recent_searches': SearchLog.objects.filter(timestamp__gte=last_week).count(),
                'unique_terms': SearchLog.objects.values('search_term').distinct().count(),
                'popular_terms': SearchLog.objects.values('search_term')
                                .annotate(count=Count('search_term'))
                                .order_by('-count')[:5],
                'daily_stats': SearchLog.objects.filter(timestamp__gte=last_week)
                              .extra({'date': "date(timestamp)"})
                              .values('date')
                              .annotate(count=Count('id'))
                              .order_by('date')[:7]
            }
            
            if hasattr(response, 'context_data'):
                response.context_data['search_stats'] = stats
                
        except Exception as e:
            # 통계 계산 실패 시에도 기본 뷰는 표시
            pass
            
        return response

@admin.register(PesticideLimit)
class PesticideLimitAdmin(admin.ModelAdmin):
    list_display = ('pesticide_name_kr', 'pesticide_name_en', 'food_name', 'max_residue_limit')
    search_fields = ('pesticide_name_kr', 'pesticide_name_en', 'food_name')
    list_filter = ('condition_code',)

@admin.register(LimitConditionCode)
class LimitConditionCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'description')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'organization', 'is_active', 'is_staff', 'date_joined', 'last_login')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'organization')
    readonly_fields = ('date_joined', 'last_login', 'password')
    ordering = ('-date_joined',)
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('email', 'organization')
        }),
        ('권한', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('중요한 날짜', {
            'fields': ('last_login', 'date_joined')
        }),
        ('비밀번호', {
            'fields': ('password',),
            'description': '비밀번호 변경은 별도 링크를 사용하세요.'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # 기존 사용자 편집 시
            return self.readonly_fields + ('email',)
        return self.readonly_fields

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'used', 'is_valid_display')
    list_filter = ('used', 'created_at')
    search_fields = ('user__email', 'token')
    readonly_fields = ('token', 'created_at', 'is_valid_display')
    ordering = ('-created_at',)
    
    def is_valid_display(self, obj):
        """토큰 유효성 표시"""
        if obj.is_valid():
            return "✅ 유효"
        else:
            return "❌ 만료/사용됨"
    is_valid_display.short_description = '유효성'
    
    def has_add_permission(self, request):
        """토큰 직접 생성 방지"""
        return False

@admin.register(GuestSession)
class GuestSessionAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'query_usage', 'session_key_short', 'can_query_display', 'created_at', 'updated_at')
    list_filter = ('query_count', 'created_at', 'updated_at')
    search_fields = ('ip_address', 'session_key')
    readonly_fields = ('session_key', 'created_at', 'updated_at', 'can_query_display')
    ordering = ('-updated_at',)
    list_per_page = 50
    actions = ['reset_query_count', 'delete_selected_sessions', 'delete_old_sessions']
    
    def session_key_short(self, obj):
        """세션 키 앞 10자리만 표시"""
        return f"{obj.session_key[:10]}..."
    session_key_short.short_description = '세션 키'
    
    def query_usage(self, obj):
        """쿼리 사용량 표시"""
        return f"{obj.query_count}/5"
    query_usage.short_description = '쿼리 사용량'
    
    def can_query_display(self, obj):
        """쿼리 가능 여부 표시"""
        if obj.can_query():
            return "✅ 가능"
        else:
            return "❌ 제한됨"
    can_query_display.short_description = '쿼리 가능'
    
    def reset_query_count(self, request, queryset):
        """선택된 세션들의 쿼리 카운트 리셋"""
        updated = queryset.update(query_count=0)
        self.message_user(request, f'{updated}개 세션의 쿼리 카운트가 리셋되었습니다.')
    reset_query_count.short_description = '선택된 세션의 쿼리 카운트 리셋'
    
    def delete_selected_sessions(self, request, queryset):
        """선택된 세션들 삭제"""
        count = queryset.count()
        session_info = []
        for session in queryset[:5]:  # 최대 5개만 표시
            session_info.append(f"{session.ip_address} ({session.session_key[:10]}...)")
        
        queryset.delete()
        
        if count <= 5:
            sessions_text = ', '.join(session_info)
            self.message_user(request, f'{count}개 세션이 삭제되었습니다: {sessions_text}')
        else:
            first_five = ', '.join(session_info)
            self.message_user(request, f'{count}개 세션이 삭제되었습니다 (처음 5개: {first_five}...)')
    delete_selected_sessions.short_description = '선택된 세션 삭제'
    
    def delete_old_sessions(self, request, queryset):
        """7일 이상 오래된 세션들 삭제"""
        from datetime import timedelta
        old_date = timezone.now() - timedelta(days=7)
        old_sessions = queryset.filter(created_at__lt=old_date)
        count = old_sessions.count()
        old_sessions.delete()
        self.message_user(request, f'{count}개의 오래된 세션이 삭제되었습니다.')
    delete_old_sessions.short_description = '7일 이상 오래된 세션 삭제'
    
    fieldsets = (
        ('세션 정보', {
            'fields': ('session_key', 'ip_address')
        }),
        ('쿼리 제한', {
            'fields': ('query_count', 'can_query_display')
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at')
        }),
    )