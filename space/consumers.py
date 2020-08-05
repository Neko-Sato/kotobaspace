from space.views import postget
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json
from datetime import datetime

from .models import Theme_board, Post

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

class postget(WebsocketConsumer):
    def connect(self):
        self.accept()
        #self.send('connect')
    def disconnect(self, close_code):
        pass
    def receive(self, text_data):
        r = json.loads(text_data)['range']
        alredyhadID = json.loads(text_data)['alredyhadID']

        data = {'Theme_board':[], 'Post':[]}
        data['Theme_board'].extend(\
            list(Theme_board.objects.filter(\
                x__gte=r['TopLeft']['x'], y__gte=r['TopLeft']['y'],\
                x__lte=r['BottomRight']['x'], y__lte=r['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Theme_board']\
            ).values())\
        )
        data['Post'].extend(\
            list(Post.objects.filter(\
                x__gte=r['TopLeft']['x'], y__gte=r['TopLeft']['y'],\
                x__lte=r['BottomRight']['x'], y__lte=r['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Post']\
            ).values())\
        )#今から三分前ののみ表示例外もある

        self.send(json.dumps(data, default=json_serial))

class post(WebsocketConsumer):
    def connect(self):
        self.accept()
    def disconnect(self, close_code):
        pass
    def receive(self, text_data):
        self.send('')