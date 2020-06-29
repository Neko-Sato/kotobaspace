from django.http import HttpResponse, QueryDict
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

# Create your views here.

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

import json
def postget(request):
    print(json.loads(request.body))
    return HttpResponse("ajax is done!")

class post(space):
    pass