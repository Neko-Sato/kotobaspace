//書き直し確定

//トークーンについて
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

//通信について
class communication {
  constructor(url, fun) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
    this.xhr.onload = function(){fun(JSON.parse(this.responseText));};
  }
  send(data){
    this.xhr.open('POST', this.url, true);
    this.xhr.setRequestHeader("X-CSRFToken", csrftoken);
    this.xhr.send(JSON.stringify(data));
  }
}

class socket {
  constructor(url, fun) {
    this.socket = new WebSocket("ws://" + window.location.host + "/websocket/" + url);
    this.socket.onmessage = function(data){fun(JSON.parse(data.data));};
  }
  send(data) {
    this.socket.send(JSON.stringify(data));
  }
}

//表示について
class display {
  constructor(x, y) {
    this.XY = {
      x: x,
      y: y
    };
    this.space = document.getElementById("space");
    this.header = document.getElementById("header");
    this.hooder = document.getElementById("hooder");
    this.selectXY = document.getElementById("selectXY");

    this.MouseAction = new MouseAction(this);
    this.getpost = new getpost(this);
    this.send_post = new send_post(this);
  }
}

class getpost {
  constructor(display) {
    this.display = display;
    window.addEventListener("resize", this.move_data.bind(this));
    this.communication = new communication('../postget/', this.outputData.bind(this));
    this.data = {
      'Theme_board':[],
      'Post':[]
    };
    this.getData();
  }
  getRange() {
    var temp = {
      TopLeft: {
        x: this.display.XY.x - window.innerWidth/2,
        y: this.display.XY.y - window.innerHeight/2,
      },
      BottomRight: {
        x: this.display.XY.x + window.innerWidth/2,
        y: this.display.XY.y + window.innerHeight/2,
      }
    };
    return temp;
  }
  getData() {
    this.communication.send({
      range: this.getRange(),
      alredyhadID: {
        Theme_board: this.data.Theme_board.map(x => x.id),
        Post: this.data.Post.map(x => x.id)
      }
    });
  }
  outputData(data) {
    Array.prototype.push.apply(this.data.Theme_board, data.Theme_board);
    Array.prototype.push.apply(this.data.Post, data.Post);
    data.Theme_board.forEach(function(item) {
      this.display.space.innerHTML += `<div id="Theme_board_${item.id}" class="block Theme_board">${item.title}</div>\n`;
    }.bind(this))
    data.Post.forEach(function(item) {
      this.display.space.innerHTML += `<div id="Post_${item.id}" class="block Post">${item.contents}</div>\n`;
    }.bind(this))
    this.move_data();
  }
  move_data() {
    this.display.space.style.backgroundPosition = (50/2 - this.display.XY.x) + "px " + (50/2 - this.display.XY.y) + "px";
    this.data.Theme_board.forEach(function(item) {
      var temp = document.getElementById("Theme_board_" + item.id);
      temp.style.left = window.innerWidth/2 + item.x - this.display.XY.x + "px";
      temp.style.top = window.innerHeight/2 + item.y - this.display.XY.y + "px";
    }.bind(this));
    this.data.Post.forEach(function(item) {
      var temp = document.getElementById("Post_" + item.id);
      temp.style.left = window.innerWidth/2 + item.x - this.display.XY.x + "px";
      temp.style.top = window.innerHeight/2 + item.y - this.display.XY.y + "px";
    }.bind(this));
  }
  remove_data() {
    var Range = this.getRange();
    this.data.Theme_board.forEach(function(item) {
      var temp = document.getElementById("Theme_board_" + item.id);
      if(!((Range.TopLeft.x < item.x && item.x < Range.BottomRight.x) && (Range.TopLeft.y < item.y && item.y < Range.BottomRight.y))){
        temp.remove();
        this.data.Theme_board = this.data.Theme_board.filter(i => i != item);
      }
    }.bind(this));
    this.data.Post.forEach(function(item) {
      var temp = document.getElementById("Post_" + item.id);
      if(!((Range.TopLeft.x < item.x && item.x < Range.BottomRight.x) && (Range.TopLeft.y < item.y && item.y < Range.BottomRight.y))){
        temp.remove();
        this.data.Post = this.data.Post.filter(i => i != item);
      }
    }.bind(this));
  }
}

//マウスについて
class MouseAction{
  constructor(display) {
    this.display = display;
    this.XY_diff = {
      x: 0,
      y: 0
    };
    this.XY_temp = {
      x: 0,
      y: 0
    };
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.display.space.onmousedown = this.onMouseDown_do.bind(this);
    this.display.space.onmouseup = this.onMouseUp_do.bind(this);
    this.onMouseDownAndMove = this.onMouseDownAndMove.bind(this)
  }
  onMouseMove(event) {
    this.XY_diff.x = this.XY_temp.x - event.pageX;
    this.XY_diff.y = this.XY_temp.y - event.pageY;
    this.XY_temp.x = event.pageX;
    this.XY_temp.y = event.pageY;
  }
  onMouseDownAndMove() {
    this.display.XY.x = this.display.XY.x + this.XY_diff.x;
    this.display.XY.y = this.display.XY.y + this.XY_diff.y;
    this.display.getpost.move_data();
  }
  onMouseDown_do() {
    document.addEventListener("mousemove", this.onMouseDownAndMove);
    space.style.cursor = "move";
  }
  onMouseUp_do() {
    space.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseDownAndMove);
    this.display.getpost.getData();
    //this.display.remove_data()
    history.replaceState('','','/space/@' + this.display.XY.x + "," + this.display.XY.y + '/');
  }
}

class send_post{
  constructor(display) {
    this.display = display;
    this.select = document.getElementById("Theme_board_Select");
    this.contents = document.getElementById("contents");
    this.XY = {
      x: 0,
      y: 0
    }
    this.sendpost = document.getElementById("sendpost");
    this.communication = new communication('../post/', this.response.bind(this));
  }
  sendData() {
    this.communication.send({
      Theme_board: this.select.value,
      contents: this.contents.value,
      x: this.XY.x,
      y: this.XY.y
    });
  }
  response(data) {
    window.location.reload();
    if (this.select.hasChildNodes()){
      for (let i=this.select.childNodes.length-1; i>=0; i--) {
        this.select.removeChild(this.select.childNodes[i]);
      }
    }
  }
  post_display() {
    this.display.selectXY.style.display = "block";
    this.display.selectXY.style.cursor = "crosshair";
    this.display.selectXY.onmousedown = this.onMouseDown_do.bind(this);
  }
  onMouseDown_do(){
    this.display.selectXY.onmousedown = null;
    this.XY = {
      x: this.display.XY.x + event.clientX - window.innerWidth/2,
      y: this.display.XY.y + event.clientY - window.innerHeight/2
    }
    this.sendpost.style.display = "block";
    this.sendpost.style.left = event.clientX + "px";
    this.sendpost.style.top = event.clientY + "px";

    this.display.getpost.data.Theme_board.forEach(function(item) {
      var option = document.createElement("option");
      option.text = item.title;
      option.value = item.id;
      this.select.appendChild(option);
    }.bind(this));
  }
}