# Generated by Django 3.2.25 on 2025-03-09 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_certificateofanalysis_pesticideresult'),
    ]

    operations = [
        migrations.AlterField(
            model_name='certificateofanalysis',
            name='applicant_id_number',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='법인등록번호'),
        ),
    ]
