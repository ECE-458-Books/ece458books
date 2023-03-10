# Generated by Django 4.1.6 on 2023-03-06 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0015_rename_url_bookimage_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookimage',
            name='book',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='image_url', serialize=False, to='books.book'),
        ),
    ]
