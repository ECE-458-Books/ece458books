# Generated by Django 4.1.6 on 2023-02-25 00:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0011_alter_bookimage_book'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bookimage',
            name='id',
        ),
        migrations.AlterField(
            model_name='bookimage',
            name='book',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='urls', serialize=False, to='books.book'),
        ),
    ]
