# Generated by Django 4.1.6 on 2023-03-22 21:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0016_alter_bookimage_book'),
    ]

    operations = [
        migrations.CreateModel(
            name='RelatedBookGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
            ],
        ),
        migrations.AddField(
            model_name='book',
            name='related_books_group',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='related_books', to='books.relatedbookgroup'),
        ),
    ]