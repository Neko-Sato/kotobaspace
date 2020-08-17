from django.http import HttpResponse, HttpResponsePermanentRedirect
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

def index(request):
    return HttpResponsePermanentRedirect('space/')

def select(request):
    return HttpResponsePermanentRedirect('@0,0/')

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
