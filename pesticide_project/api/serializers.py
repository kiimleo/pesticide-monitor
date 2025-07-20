# path of this code : pesticide_project/api/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import EmailValidator
from django.contrib.auth.password_validation import validate_password
from .models import LimitConditionCode, PesticideLimit, User
from .models import CertificateOfAnalysis, PesticideResult
import re

class LimitConditionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LimitConditionCode
        fields = ['code', 'description']

class PesticideLimitSerializer(serializers.ModelSerializer):
    condition_code_description = serializers.CharField(source='condition_code.description', read_only=True)
    condition_code_symbol = serializers.CharField(source='condition_code.code', read_only=True)
    matching_type = serializers.CharField(required=False)
    original_food_name = serializers.CharField(required=False)

    class Meta:
        model = PesticideLimit
        fields = ['id', 'pesticide_name_kr', 'pesticide_name_en', 'food_name',
                 'max_residue_limit', 'condition_code', 'condition_code_description',
                 'condition_code_symbol', 'matching_type', 'original_food_name']

    def get_original_food_name(self, obj):
        return self.context.get('original_food_name', None)


# 회원가입 시리얼라이저
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'organization')
        extra_kwargs = {
            'email': {'required': True, 'validators': [EmailValidator()]},
            'organization': {'required': True, 'min_length': 1}
        }
    
    def validate_email(self, value):
        """이메일 중복 검사"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value
    
    def validate_password(self, value):
        """비밀번호 유효성 검사"""
        # 최소 8자, 영문+숫자 필수
        if len(value) < 8:
            raise serializers.ValidationError("비밀번호는 최소 8자 이상이어야 합니다.")
        
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("비밀번호에 영문자가 포함되어야 합니다.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("비밀번호에 숫자가 포함되어야 합니다.")
        
        return value
    
    def validate_organization(self, value):
        """소속기관 유효성 검사"""
        if not value or not value.strip():
            raise serializers.ValidationError("소속기관을 입력해주세요.")
        return value.strip()
    
    def validate(self, attrs):
        """비밀번호 확인 검사"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': '비밀번호가 일치하지 않습니다.'
            })
        return attrs
    
    def create(self, validated_data):
        # password_confirm 제거
        validated_data.pop('password_confirm', None)
        
        user = User(
            email=validated_data['email'],
            organization=validated_data['organization'],
            username=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

# 로그인 시리얼라이저
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # 이메일로 사용자 찾기
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise serializers.ValidationError('비밀번호가 틀렸습니다.')
                if not user.is_active:
                    raise serializers.ValidationError('비활성화된 계정입니다.')
                attrs['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError('존재하지 않는 이메일입니다.')
        else:
            raise serializers.ValidationError('이메일과 비밀번호를 입력해주세요.')
        
        return attrs

# 비밀번호 재설정 요청 시리얼라이저
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError('존재하지 않는 이메일입니다.')
        return value

# 비밀번호 재설정 시리얼라이저
class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        """새 비밀번호 유효성 검사"""
        if len(value) < 8:
            raise serializers.ValidationError("비밀번호는 최소 8자 이상이어야 합니다.")
        
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("비밀번호에 영문자가 포함되어야 합니다.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("비밀번호에 숫자가 포함되어야 합니다.")
        
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': '비밀번호가 일치하지 않습니다.'
            })
        return attrs

# 사용자 정보 시리얼라이저
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'organization', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class PesticideResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PesticideResult
        fields = '__all__'


class CertificateOfAnalysisSerializer(serializers.ModelSerializer):
    pesticide_results = PesticideResultSerializer(many=True, read_only=True)

    class Meta:
        model = CertificateOfAnalysis
        fields = '__all__'