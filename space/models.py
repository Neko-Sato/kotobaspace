from django.db import models
from django.conf import settings
from django.utils import timezone

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contents = models.TextField()
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return '{} -> {}, {}  ({}, {})'.format(self.user, self.id, self.contents, self.x, self.y)
    def get_dict(self):
        return {
            'id': self.id,
            'user' : {
                'str' : str(self.user),
                'id' : self.user.id,
                },
            'contents' : self.contents,
            'XY' : {
                'x' : self.x,
                'y' : self.y,
                },
            'datetime' : self.datetime,
        }