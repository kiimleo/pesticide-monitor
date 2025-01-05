# path of this code : C:\Users\leo\pesticide\pesticide_project\api\serializers.py

from rest_framework import serializers
from .models import LimitConditionCode, PesticideLimit, User

class LimitConditionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LimitConditionCode
        fields = ['code', 'description']

class PesticideLimitSerializer(serializers.ModelSerializer):
    condition_code_description = serializers.CharField(source='condition_code.description', read_only=True)
    matching_type = serializers.CharField(required=False)
    original_food_name = serializers.CharField(required=False)

    class Meta:
        model = PesticideLimit
        fields = ['id', 'pesticide_name_kr', 'pesticide_name_en', 'food_name',
                 'max_residue_limit', 'condition_code', 'condition_code_description',
                 'matching_type', 'original_food_name']

    def get_original_food_name(self, obj):
        return self.context.get('original_food_name', None)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'organization', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'organization': {'required': True}
        }

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            organization=validated_data['organization'],
            username=validated_data['email']  # username을 email과 동일하게 설정
        )
        user.set_password(validated_data['password'])
        user.save()
        return user