from django.urls import path
from . import views

app_name = 'space'
urlpatterns = [
    path('', views.index),
    path('space/@<int:x>,<int:y>/', views.space.as_view()),
    path('space/postget/', views.postget),
    path('post/', views.post.as_view()),
]