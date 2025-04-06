# Generated by Django 3.2.25 on 2025-04-06 04:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_pesticideresult_pdf_korea_mrl_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='pesticideresult',
            name='db_korea_mrl_symbol',
            field=models.CharField(blank=True, max_length=10, null=True, verbose_name='DB 잔류허용기준 기호'),
        ),
        migrations.AddField(
            model_name='pesticideresult',
            name='db_korea_mrl_text',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='DB 잔류허용기준 텍스트'),
        ),
    ]
