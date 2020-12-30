from datetime import datetime, timedelta
from .models import Post

def str2datetime(arg):
    if arg == 'now':
        temp = datetime.now()
    else:
        temp = datetime.fromisoformat(arg.replace('Z', '+00:00'))
    return temp

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
            'Time' : 'now',
            },
        }
    def remove(self):
        self.userslist.remove(self)
    def set_range(self, data):
        self.range = data
    def request_post(self, data):
        data = {
            'Post' : [],
        }
        data['Post'].extend(\
            [x.get_dict() for x in Post.objects.filter(\
                x__range=(self.range['TopLeft']['x'], self.range['BottomRight']['x']),\
                y__range=(self.range['TopLeft']['y'], self.range['BottomRight']['y']),\
                datetime__range=((lambda e: (e-timedelta(seconds=30), e))(str2datetime(self.range['Time']))),\
            )])
        self.socket.send('return_post', data)
    def test(self, data):
        self.socket.send()
    def create_post(self, data):
        temp_object = Post.objects.create(\
        user = self.socket.scope['user'],\
        contents = data['contents'],\
        x = float(data['XY']['x']), y = float(data['XY']['y']))
        data = temp_object.get_dict()
        self.userslist.send('new_post', data, lambda u: \
            (u.range['TopLeft']['x'] <= temp_object.x <= u.range['BottomRight']['x']) and \
            (u.range['TopLeft']['y'] <= temp_object.y <= u.range['BottomRight']['y']) and \
            (u.range['Time'] == 'now')\
        )

class posts():
    def get_post(id):
        return Post.objects.get(id=int(id)).get_dict()