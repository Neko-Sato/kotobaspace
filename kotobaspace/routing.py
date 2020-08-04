from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

def inlude(name):
    exec('import ' + name + ' as temp')
    return temp.websocket_urlpatterns

websocket_urlpatterns = [
    path('websocket', inlude('space.routing')),
]

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})