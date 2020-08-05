from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

def getModule(name):
    exec('import ' + name + ' as temp')
    return locals()['temp']

def include(name):
    return URLRouter(getModule(name).websocket_urlpatterns)

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