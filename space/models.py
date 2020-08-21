from django.db import models
from django.conf import settings
from django.utils import timezone

class Theme_board(models.Model):
    title = models.CharField(max_length=128)
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return self.title
    def get_dict(self):
        return {
            'id' : self.id,
            'title' : self.title,
            'XY' : {
                'x' : self.x,
                'y' : self.y,
            },
            'datetime' : self.datetime,
        }

class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    Theme_board = models.ForeignKey(Theme_board, on_delete=models.CASCADE)
    contents = models.TextField()
    x, y = models.FloatField(), models.FloatField()
    datetime = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return '{} :{}, ({}, {})'.format(self.user, self.contents, self.x, self.y)
    def get_dict(self):
        return {
            'id': self.id,
            'user' : {
                'str' : str(self.user),
                'id' : self.user.id,
            },
            'Theme_board' : {
                'str' : str(self.Theme_board),
                'id' : self.Theme_board.id,
                },
            'contents' : self.contents,
            'XY' : {
                'x' : self.x,
                'y' : self.y,
            },
            'datetime' : self.datetime,
        }