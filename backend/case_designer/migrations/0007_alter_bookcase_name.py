# Generated by Django 4.1.7 on 2023-03-23 22:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('case_designer', '0006_bookcase_last_editor_alter_bookcase_creator'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookcase',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]