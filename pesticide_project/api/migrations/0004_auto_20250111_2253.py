# Generated by Django 3.2.25 on 2025-01-11 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_limitconditioncode_code'),
    ]

    operations = [
        migrations.CreateModel(
            name='PesticideDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reg_yn_nm', models.CharField(max_length=100)),
                ('use_pprtm', models.CharField(max_length=100)),
                ('prdlst_reg_no', models.CharField(max_length=100)),
                ('prdlst_reg_dt', models.CharField(max_length=8)),
                ('prdlst_reg_vald_dt', models.CharField(max_length=8)),
                ('mnf_incm_dvs_nm', models.CharField(max_length=100)),
                ('persn_lvstck_toxcty', models.CharField(max_length=100)),
                ('use_tmno', models.CharField(max_length=100)),
                ('cpr_nm', models.CharField(max_length=100)),
                ('prdlst_kor_nm', models.CharField(max_length=200)),
                ('prdlst_eng_nm', models.CharField(max_length=200)),
                ('mdc_shap_nm', models.CharField(max_length=100)),
                ('sickns_hlsct_nm_weeds_nm', models.CharField(max_length=200)),
                ('brnd_nm', models.CharField(max_length=100)),
                ('crops_nm', models.CharField(max_length=100)),
                ('prpos_dvs_cd_nm', models.CharField(max_length=100)),
                ('dilu_drng', models.CharField(max_length=100)),
                ('eclgy_toxcty', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddIndex(
            model_name='pesticidedetail',
            index=models.Index(fields=['prdlst_kor_nm'], name='api_pestici_prdlst__994f0b_idx'),
        ),
        migrations.AddIndex(
            model_name='pesticidedetail',
            index=models.Index(fields=['crops_nm'], name='api_pestici_crops_n_aa8446_idx'),
        ),
    ]
