# Generated by Django 3.2.25 on 2025-03-07 14:56

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_auto_20250112_1451'),
    ]

    operations = [
        migrations.CreateModel(
            name='CertificateOfAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('certificate_number', models.CharField(max_length=50, unique=True, verbose_name='증명서번호')),
                ('applicant_name', models.CharField(max_length=100, verbose_name='신청인명/기관명')),
                ('applicant_id_number', models.CharField(max_length=50, verbose_name='법인등록번호')),
                ('applicant_address', models.TextField(verbose_name='주소')),
                ('applicant_tel', models.CharField(max_length=50, verbose_name='전화번호')),
                ('analytical_purpose', models.CharField(max_length=100, verbose_name='검정목적')),
                ('sample_description', models.CharField(max_length=100, verbose_name='검정품목')),
                ('producer_info', models.CharField(max_length=200, verbose_name='생산자/수거지')),
                ('analyzed_items', models.CharField(max_length=200, verbose_name='검정항목')),
                ('sample_quantity', models.CharField(max_length=50, verbose_name='시료점수 및 중량')),
                ('test_start_date', models.DateField(verbose_name='검정시작일')),
                ('test_end_date', models.DateField(verbose_name='검정종료일')),
                ('analytical_method', models.TextField(verbose_name='검정방법')),
                ('original_file', models.FileField(upload_to='certificates/', verbose_name='원본파일')),
                ('upload_date', models.DateTimeField(default=django.utils.timezone.now, verbose_name='업로드일시')),
            ],
            options={
                'verbose_name': '검정증명서',
                'verbose_name_plural': '검정증명서',
                'db_table': 'certificate_of_analysis',
                'ordering': ['-upload_date'],
            },
        ),
        migrations.CreateModel(
            name='PesticideResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pesticide_name', models.CharField(max_length=100, verbose_name='농약성분명')),
                ('detection_value', models.DecimalField(decimal_places=3, max_digits=10, verbose_name='검출량(mg/kg)')),
                ('korea_mrl', models.DecimalField(blank=True, decimal_places=3, max_digits=10, null=True, verbose_name='한국 잔류허용기준(mg/kg)')),
                ('export_country', models.CharField(blank=True, max_length=100, null=True, verbose_name='수출국명')),
                ('export_mrl', models.DecimalField(blank=True, decimal_places=3, max_digits=10, null=True, verbose_name='수출국 잔류허용기준(mg/kg)')),
                ('pdf_result', models.CharField(max_length=20, verbose_name='원본 검토의견')),
                ('calculated_result', models.CharField(max_length=20, verbose_name='계산된 검토의견')),
                ('is_consistent', models.BooleanField(default=True, verbose_name='검토의견 일치여부')),
                ('certificate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pesticide_results', to='api.certificateofanalysis', verbose_name='검정증명서')),
            ],
            options={
                'verbose_name': '농약 검출 결과',
                'verbose_name_plural': '농약 검출 결과',
                'db_table': 'pesticide_results',
            },
        ),
    ]
