# Generated by Django 4.1.5 on 2023-02-08 16:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0006_rename_book_sale_book_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sale',
            old_name='book_id',
            new_name='book',
        ),
    ]