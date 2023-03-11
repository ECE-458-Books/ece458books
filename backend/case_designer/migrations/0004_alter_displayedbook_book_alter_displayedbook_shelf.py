# Generated by Django 4.1.7 on 2023-03-11 18:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0016_alter_bookimage_book'),
        ('case_designer', '0003_rename_ordering_displayedbook_display_order_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='displayedbook',
            name='book',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='books.book'),
        ),
        migrations.AlterField(
            model_name='displayedbook',
            name='shelf',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='displayed_books', to='case_designer.shelf'),
        ),
    ]
