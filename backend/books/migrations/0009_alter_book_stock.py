# Generated by Django 4.1.5 on 2023-02-09 12:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0008_book_stock'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]