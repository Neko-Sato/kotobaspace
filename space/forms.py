from django import forms
from .models import *
from django.utils import timezone

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('Theme_board', 'contents', 'x', 'y')
        ##わからんです２