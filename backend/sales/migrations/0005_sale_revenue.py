# Generated by Django 4.1.5 on 2023-02-04 18:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0004_remove_sale_book_sale_book'),
    ]

    operations = [
        migrations.AddField(
            model_name='sale',
            name='revenue',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]