from django.http import HttpResponse, HttpResponsePermanentRedirect
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic
from .application import posts
from django.contrib import auth
from urllib import parse

def index(request):
    return HttpResponsePermanentRedirect('space/')

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'

class get_post(LoginRequiredMixin, generic.TemplateView):
    template_name = 'post.html'
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        get = dict(parse.parse_qsl(self.request.META['QUERY_STRING']))
        context.update(posts.get_post(get['id']))
        return context
