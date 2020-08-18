from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .application import users
import json
from datetime import datetime

userslist = users()

def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

class test(WebsocketConsumer):
    def connect(self):
        #self.user = self.scope['user']
        self.accept()
        self.com = userslist(self)
    def disconnect(self, close_code):
        self.com.remove()
    def send(self, msg='OK', data={}):
        super().send(json.dumps({'massage': msg, 'data' : data}, default=json_serial))
    def receive(self, text_data):
        data = json.loads(text_data)
        try:
            eval('self.com.' + data['function'])(data['argument'])
        except AttributeError:
            print('error', data)