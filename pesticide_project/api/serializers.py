from rest_framework import serializers
from .models import LimitConditionCode, PesticideLimit, User

class LimitConditionCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LimitConditionCode
        fields = ['code', 'description']

class PesticideLimitSerializer(serializers.ModelSerializer):
    condition_code_description = serializers.CharField(source='condition_code.description', read_only=True)

    class Meta:
        model = PesticideLimit
        fields = ['id', 'pesticide_name_kr', 'pesticide_name_en', 'food_name',
                 'max_residue_limit', 'condition_code', 'condition_code_description']


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