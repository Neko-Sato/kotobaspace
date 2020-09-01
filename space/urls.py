from django.urls import path
from . import views

app_name = 'space'
urlpatterns = [
    path('', views.index),
    path('space/', views.space.as_view()),
    path('get_post/', views.get_post.as_view()),
]