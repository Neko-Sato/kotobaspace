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
        alredyhadID = data
        data = {
            'Theme_board' : [],
            'Post' : [],
        }
        data['Theme_board'].extend(\
            list(Theme_board.objects.filter(\
                x__gte=self.range['TopLeft']['x'], y__gte=self.range['TopLeft']['y'],\
                x__lte=self.range['BottomRight']['x'], y__lte=self.range['BottomRight']['y'],\
            ).exclude(\
                id__in=alredyhadID['Theme_board']\
            ).values())\
        )
        data['Post'].extend(\
            list(Post.objects.filter(\
                x__gte=self.range['TopLeft']['x'], y__gte=self.range['TopLeft']['y'],\
                x__lte=self.range['BottomRight']['x'], y__lte=self.range['BottomRight']['y'],\
                display__exact=True, \
            ).exclude(\
                id__in=alredyhadID['Post']\
            ).values())\
        )
        for i in data['Post']:
            del i['display']
        self.socket.send('set_space', data)
    def test(self, data):
        self.socket.send()
    def post(self, data):
        temp_object = Post.objects.create(\
        user = self.socket.scope['user'],\
        Theme_board = Theme_board.objects.get(pk=data['Theme_board']),\
        contents = data['contents'],\
        x = float(data['XY']['x']), y = float(data['XY']['y']))
        def fun(x):
            x.display = False
            x.save()
        Timer(180, fun, (temp_object,)).start()
        dict_temp_object = temp_object.__dict__.copy()
        del dict_temp_object['_state']
        del dict_temp_object['display']
        self.userslist.send('new_post', dict_temp_object, lambda u: \
            (u.range['TopLeft']['x'] <= temp_object.x <= u.range['BottomRight']['x']) and \
            (u.range['TopLeft']['y'] <= temp_object.y <= u.range['BottomRight']['y'])\
            )