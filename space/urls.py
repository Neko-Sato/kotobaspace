from django.urls import path
from . import views

app_name = 'space'
urlpatterns = [
    path('', views.index),
    path('space/', views.select),
    path('space/@<str:x>,<str:y>/', views.space.as_view()),
    path('space/post/', views.postget.as_view()),
    path('space/postget/', views.postget.as_view()),
]