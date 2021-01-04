from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .application import users
import inspect
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
        data = {'massage': msg, 'data' : data}
        super().send(json.dumps(data, default=json_serial))
        #print("send: " , data)
    def receive(self, text_data):
        data = json.loads(text_data)
        #print("receive: " , data)
        massage = data.get('massage')
        data = data.get('data')
        if massage == None or data == None:
            self.send('error: Missing format')
            return
        dict(inspect.getmembers(self.com, inspect.ismethod)).get(massage, \
            lambda x: self.send('error: Not Found Code'))\
            (data)