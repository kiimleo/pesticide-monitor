from django.db import models

class LimitConditionCode(models.Model):
    code = models.CharField(max_length=2, primary_key=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'limit_condition_codes'

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