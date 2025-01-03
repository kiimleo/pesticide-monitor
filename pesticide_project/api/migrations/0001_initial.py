# Generated by Django 3.2.25 on 2024-11-10 13:08

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
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
                'verbose_name': '제한조건 코드',
                'verbose_name_plural': '제한조건 코드',
                'db_table': 'limit_condition_codes',
            },
        ),
        migrations.CreateModel(
            name='SearchLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('search_term', models.CharField(max_length=200)),
                ('pesticide_term', models.CharField(blank=True, max_length=100, null=True)),
                ('food_term', models.CharField(blank=True, max_length=100, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.GenericIPAddressField(null=True)),
                ('user_agent', models.TextField(null=True)),
                ('results_count', models.IntegerField(default=0)),
            ],
            options={
                'verbose_name': '검색 로그',
                'verbose_name_plural': '검색 로그',
                'db_table': 'search_logs',
                'ordering': ['-timestamp'],
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
                'verbose_name': '농약 잔류허용기준',
                'verbose_name_plural': '농약 잔류허용기준',
                'db_table': 'pesticide_limits',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('organization', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='custom_user_set', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='custom_user_set', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': '사용자',
                'verbose_name_plural': '사용자',
                'db_table': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.AddIndex(
            model_name='pesticidelimit',
            index=models.Index(fields=['pesticide_name_kr'], name='pesticide_l_pestici_ce9430_idx'),
        ),
        migrations.AddIndex(
            model_name='pesticidelimit',
            index=models.Index(fields=['pesticide_name_en'], name='pesticide_l_pestici_458c40_idx'),
        ),
        migrations.AddIndex(
            model_name='pesticidelimit',
            index=models.Index(fields=['food_name'], name='pesticide_l_food_na_f9a2cf_idx'),
        ),
    ]
