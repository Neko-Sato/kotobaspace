from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from importlib import import_module

def include(name):
    return URLRouter(import_module(name).websocket_urlpatterns)

websocket_urlpatterns = [
    path('websocket/', include('space.routing')),
]

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})