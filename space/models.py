from django.db import models
from django.conf import settings
from django.utils import timezone

class Theme_board(models.Model):
    title = models.CharField(max_length=128)
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return self.title

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    Theme_board = models.ForeignKey(Theme_board, on_delete=models.CASCADE)
    contents = models.TextField()
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
