# Generated by Django 4.1.7 on 2023-04-08 19:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0007_rename_book_id_sale_book'),
    ]

    operations = [
        migrations.AddField(
            model_name='salesreconciliation',
            name='is_sales_record',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]