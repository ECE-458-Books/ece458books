# Generated by Django 4.1.6 on 2023-02-25 18:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0013_alter_bookimage_book'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='height',
            field=models.FloatField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='book',
            name='pageCount',
            field=models.PositiveIntegerField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='book',
            name='thickness',
            field=models.FloatField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='book',
            name='width',
            field=models.FloatField(blank=True, default=None, null=True),
        ),
    ]