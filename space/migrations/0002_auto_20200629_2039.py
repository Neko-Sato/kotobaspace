# Generated by Django 3.0.7 on 2020-06-29 11:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('space', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='tb',
            new_name='Theme_board',
        ),
    ]
