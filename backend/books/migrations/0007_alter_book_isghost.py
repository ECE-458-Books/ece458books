# Generated by Django 4.1.5 on 2023-02-08 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0006_alter_book_isghost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='isGhost',
            field=models.BooleanField(default=False),
        ),
    ]
