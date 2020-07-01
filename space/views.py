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
    r = json.loads(request.body)['range']
    alredyhadID = json.loads(request.body)['alredyhadID']
    data = {'Theme_board':[], 'Post':[]}
    for i in r:
        data['Theme_board'].extend(\
            list(Theme_board.objects.filter(\
                x__gte=i['TopLeft']['x'], y__gte=i['TopLeft']['y'],\
                x__lte=i['BottomRight']['x'], y__lte=i['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Theme_board']\
            ).values())\
        )
        data['Post'].extend(\
            list(Post.objects.filter(\
                x__gte=i['TopLeft']['x'], y__gte=i['TopLeft']['y'],\
                x__lte=i['BottomRight']['x'], y__lte=i['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Post']\
            ).values())\
        )#今から三分前ののみ表示例外もある
    print(data)
    return HttpResponse(json.dumps(data, default=json_serial))

class post(space):
    pass