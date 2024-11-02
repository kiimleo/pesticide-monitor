# Generated by Django 3.2.25 on 2024-10-27 14:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LimitConditionCode',
            fields=[
                ('code', models.CharField(max_length=2, primary_key=True, serialize=False)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'limit_condition_codes',
            },
        ),
        migrations.CreateModel(
            name='PesticideLimit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pesticide_name_kr', models.CharField(max_length=100)),
                ('pesticide_name_en', models.CharField(max_length=100)),
                ('food_name', models.CharField(max_length=100)),
                ('max_residue_limit', models.DecimalField(decimal_places=3, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('condition_code', models.ForeignKey(blank=True, db_column='condition_code', null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.limitconditioncode')),
            ],
            options={
                'db_table': 'pesticide_limits',
            },
        ),
    ]