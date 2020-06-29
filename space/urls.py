from django.urls import path
from . import views

app_name = 'space'
urlpatterns = [
    path('space/@<str:x>,<str:y>', views.space.as_view(), name='space'),  
    path('space/postget/', views.postget, name='postget'),
    path('post/', views.post.as_view(), name='space'), 
]