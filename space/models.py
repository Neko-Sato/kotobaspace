from django.db import models
from django.conf import settings
from django.utils import timezone

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contents = models.TextField()
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
