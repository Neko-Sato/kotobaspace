from django import forms
from .models import Theme_board, Post
from django.utils import timezone

#class PostForm(forms.ModelForm):
#    class Meta:
#        model = Post
#        fields = ()

import json
from django.utils import timezone
def PostForm(request):
    body = json.loads(request.body)
    f = Post(\
    user = request.user,\
    Theme_board = Theme_board.objects.filter(id__in=body['Theme_board'])[0],\
    contents = body['contents'],\
    x = float(body['x']),\
    y = float(body['y']),\
    datetime = timezone.now)
    f.save()