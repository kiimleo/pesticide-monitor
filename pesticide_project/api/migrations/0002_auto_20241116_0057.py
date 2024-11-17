# Generated by Django 3.2.25 on 2024-11-15 15:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FoodCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_category', models.CharField(max_length=100)),
                ('sub_category', models.CharField(blank=True, max_length=100, null=True)),
                ('food_name', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'food_categories',
            },
        ),
        migrations.AddIndex(
            model_name='foodcategory',
            index=models.Index(fields=['food_name'], name='food_catego_food_na_dfba74_idx'),
        ),
        migrations.AddIndex(
            model_name='foodcategory',
            index=models.Index(fields=['main_category'], name='food_catego_main_ca_dfbf70_idx'),
        ),
        migrations.AddIndex(
            model_name='foodcategory',
            index=models.Index(fields=['sub_category'], name='food_catego_sub_cat_0a5f2e_idx'),
        ),
    ]
