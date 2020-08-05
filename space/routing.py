from django.urls import path
from . import consumers

websocket_urlpatterns = [
    #path('test', consumers.test),
    path('post/', consumers.post),
    path('postget/', consumers.postget),
]