# Generated by Django 4.1.6 on 2023-02-25 07:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('buybacks', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='buyback',
            old_name='cost',
            new_name='revenue',
        ),
    ]
