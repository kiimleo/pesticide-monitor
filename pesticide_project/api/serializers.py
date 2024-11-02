from rest_framework import serializers
from .models import LimitConditionCode, PesticideLimit

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