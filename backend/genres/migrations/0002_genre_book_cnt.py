# Generated by Django 4.1.5 on 2023-02-03 05:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('genres', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='genre',
            name='book_cnt',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
