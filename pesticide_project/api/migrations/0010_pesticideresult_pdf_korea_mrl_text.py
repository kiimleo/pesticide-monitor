# Generated by Django 3.2.25 on 2025-04-06 04:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20250309_1559'),
    ]

    operations = [
        migrations.AddField(
            model_name='pesticideresult',
            name='pdf_korea_mrl_text',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='PDF 잔류허용기준 텍스트'),
        ),
    ]
