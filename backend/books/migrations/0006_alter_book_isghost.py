# Generated by Django 4.1.5 on 2023-02-07 23:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0005_book_isghost_alter_book_isbn_13'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='isGhost',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
