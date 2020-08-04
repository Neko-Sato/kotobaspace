from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

class test(WebsocketConsumer):
    def connect(self):
        self.accept()
    def disconnect(self, close_code):
        pass
    def receive(self, text_data):
        self.send(json.dumps({
            "text": text_data,
        }))
        pass