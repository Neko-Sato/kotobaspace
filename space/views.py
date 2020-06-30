from django.http import HttpResponse, HttpResponsePermanentRedirect, QueryDict
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic
from .models import Theme_board, Post
from datetime import datetime
from django.forms.models import model_to_dict
import json

# Create your views here.

def index(request):
    return HttpResponsePermanentRedirect('space/')

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def postget(request):
    size = json.loads(request.body)
    data = {}
    data.update(\
        Theme_board = list(Theme_board.objects.filter(\
            x__gte=size['TopLeft']['x'], y__gte=size['TopLeft']['y'],\
            x__lte=size['BottomRight']['x'], y__lte=size['BottomRight']['y']\
        ).values()), \
        Post = list(Post.objects.filter(\
            x__gte=size['TopLeft']['x'], y__gte=size['TopLeft']['y'],\
            x__lte=size['BottomRight']['x'], y__lte=size['BottomRight']['y']\
        ).values())\
    )
    print(data)
    return HttpResponse(json.dumps(data, default=json_serial))

class post(space):
    pass