# Generated by Django 4.1.5 on 2023-02-03 06:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('genres', '0003_alter_genre_book_cnt'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='genre',
            name='book_cnt',
        ),
    ]
