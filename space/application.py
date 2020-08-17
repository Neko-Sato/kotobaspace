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
        #一手前のは除く
        #範囲内のpost,display=Trueを拾得する
        #範囲内のテーマボードもかな
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
        #範囲内のuserに送る