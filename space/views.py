from django.http import HttpResponse, HttpResponsePermanentRedirect, QueryDict
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic
from .models import Theme_board, Post
from .forms import PostForm
from datetime import datetime
import json

# Create your views here.

def index(request):
    return HttpResponsePermanentRedirect('space/')

def select(request):
    return HttpResponsePermanentRedirect('@0,0/')

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

class postget(LoginRequiredMixin, generic.TemplateView):
    def post(self, request, **kwargs):
        r = json.loads(request.body)['range']
        alredyhadID = json.loads(request.body)['alredyhadID']
        data = {'Theme_board':[], 'Post':[]}
        data['Theme_board'].extend(\
            list(Theme_board.objects.filter(\
                x__gte=r['TopLeft']['x'], y__gte=r['TopLeft']['y'],\
                x__lte=r['BottomRight']['x'], y__lte=r['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Theme_board']\
            ).values())\
        )
        data['Post'].extend(\
            list(Post.objects.filter(\
                x__gte=r['TopLeft']['x'], y__gte=r['TopLeft']['y'],\
                x__lte=r['BottomRight']['x'], y__lte=r['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Post']\
            ).values())\
        )#今から三分前ののみ表示例外もある
        return HttpResponse(json.dumps(data, default=json_serial))

class post(LoginRequiredMixin, generic.TemplateView):
    def post(self, request, **kwargs):
        body = json.loads(request.body)
        form = PostForm(body)
##わからんです
        return HttpResponse(json.dumps({}))