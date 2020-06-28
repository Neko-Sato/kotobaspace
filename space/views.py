from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic

# Create your views here.

class space(LoginRequiredMixin, generic.TemplateView):
    template_name = 'space.html'


from django.http import HttpResponse
def postget(request):
    #QueryDict(request.body, encoding='utf-8')
    return HttpResponse("ajax is done!")

class post(space):
    pass