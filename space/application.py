from datetime import datetime, timedelta
from threading import Timer
from .models import Theme_board, Post

class users:
    def __init__(self):
        self.users = []
    def __call__(self, u):
        return self.append(u)
    def append(self, u):
        temp = user(u, self)
        self.users.append(temp)
        return temp
    def remove(self, u):
        self.users.remove(u)
    def send(self, msg='OK', data={}, fun=lambda u: True):
        _ = list(map(lambda u: u.socket.send(msg, data), filter(fun, self.users)))

class user:
    def __init__(self, socket, userslist):
        self.socket = socket
        self.userslist = userslist
        self.range = {
            'TopLeft' : {
                'x' : 0,
                'y' : 0,
            },
            'BottomRight' : {
                'x' : 0,
                'y' : 0,
            },
        }
    def remove(self):
        self.userslist.remove(self)
    def set_range(self, data):
        self.range = data
    def get_sapce(self, data):
        data = {
            'Theme_board' : [],
            'Post' : [],
        }
        data['Theme_board'].extend(\
            list(Theme_board.objects.filter(\
                x__range=(self.range['TopLeft']['x'], self.range['BottomRight']['x']),\
                y__range=(self.range['TopLeft']['y'], self.range['BottomRight']['y']),\
            ).values())\
        )
        data['Post'].extend(\
            list(Post.objects.filter(\
                x__range=(self.range['TopLeft']['x'], self.range['BottomRight']['x']),\
                y__range=(self.range['TopLeft']['y'], self.range['BottomRight']['y']),\
                datetime__gt=datetime.now()-timedelta(seconds=30),\
            ).values())\
        )
        for i in data['Post']:
            del i['display']
        self.socket.send('set_space', data)
    def test(self, data):
        self.socket.send()
    def create_post(self, data):
        temp_object = Post.objects.create(\
        user = self.socket.scope['user'],\
        Theme_board = Theme_board.objects.get(pk=data['Theme_board']),\
        contents = data['contents'],\
        x = float(data['XY']['x']), y = float(data['XY']['y']))
        def fun(x):
            x.display = False
            x.save()
        Timer(30, fun, (temp_object,)).start()
        dict_temp_object = temp_object.__dict__.copy()
        del dict_temp_object['_state']
        del dict_temp_object['display']
        self.userslist.send('new_post', dict_temp_object, lambda u: \
            (u.range['TopLeft']['x'] <= temp_object.x <= u.range['BottomRight']['x']) and \
            (u.range['TopLeft']['y'] <= temp_object.y <= u.range['BottomRight']['y'])\
            )