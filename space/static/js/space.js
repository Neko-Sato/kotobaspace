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
class Http_Post {
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

class Socket {
  constructor(url, fun) {
    this.socket = new WebSocket("ws://" + window.location.host + "/websocket/" + url);
    this.socket.onmessage = function(data){fun(JSON.parse(data.data));};
    this.socket.onopen = function() { this.send( { massage : 'test', data : {} } ) }.bind(this);
    if(this.socket.readyState == WebSocket.OPEN) this.socket.onopen();
  }
  send(data) {
    this.socket.send(JSON.stringify(data));
  }
}

//メイン
class Main {
  constructor() {
    this.Application = null;
    this.space = document.getElementById("space");

    this.header = document.getElementById("header");
    this.hooder = document.getElementById("hooder");
  }
  Execution(x, y){
    this.Application = new Application(x, y);
  }
}

class Application {
  constructor(x, y) {
    this.space = document.getElementById("space");

    this.XY = {x:x, y:y}
    this.data = {Theme_board: [], Post: []}

    this.socket = new Socket('test/', this.recv.bind(this));
    this.CreatePost = new CreatePost(this);
    this.MouseAction = new MouseAction(this.space);
    this.MouseAction.MouseMove = function(XYdiff){
      this.XY.x = this.XY.x + XYdiff.x;
      this.XY.y = this.XY.y + XYdiff.y;
      this.moveObjectItem();
    }.bind(this);
    this.MouseAction.onMouseUp = function(XYdiff){
      this.getSpace();
      history.replaceState('','','/space/@' + this.XY.x + "," + this.XY.y + '/');
    }.bind(this);

    window.addEventListener("resize", this.getSpace.bind(this));
    this.socket.socket.onopen = this.getSpace.bind(this);
  }
  recv(data){
    console.log(data);
    if(data.massage == 'set_space'){
      this.setSpace(data.data);
    } else if(data.massage == 'new_post'){
      this.newPost(data.data);
    }
  }
  getSpace(){
    this.socket.send({massage : 'set_range', data : this.getRange()});
    this.socket.send({massage : 'get_sapce', data : {
      Theme_board: this.data.Theme_board.map(x => x.id),
      Post: this.data.Post.map(x => x.id)
    }});
  }
  setSpace(data){
    Array.prototype.push.apply(this.data.Theme_board, data.Theme_board.map(x => new Theme_board(x, this.dataremove.bind(this))));
    Array.prototype.push.apply(this.data.Post, data.Post.map(x => new Post(x, this.dataremove.bind(this))));
    this.moveObjectItem()
  }
  moveObjectItem() {
    this.space.style.backgroundPosition = (50/2 - this.XY.x) + "px " + (50/2 - this.XY.y) + "px";
    this.data.Theme_board.forEach(x => x.move(this.XY), this);
    this.data.Post.forEach(x => x.move(this.XY), this);
  }
  CreatePostSend(){
    this.socket.send({massage : "create_post" , data : this.CreatePost.getData()})
  }
  newPost(data){
    this.data.Post.push(new Post(data, this.dataremove.bind(this)));
    this.moveObjectItem();
  }
  dataremove(arg) {
    arg.getElement().remove();
    this.data[arg.__proto__.constructor.name] = this.data[arg.__proto__.constructor.name].filter(x => x != arg);
  }
  getRange(){
    var temp = {
      TopLeft: {
        x: this.XY.x - window.innerWidth/2,
        y: this.XY.y - window.innerHeight/2,
      },
      BottomRight: {
        x: this.XY.x + window.innerWidth/2,
        y: this.XY.y + window.innerHeight/2,
      }
    };
    return temp;
  }
}

class CreatePost{
  constructor(app){
    this.app = app;
    this.space = document.getElementById("space");
    this.selectXY = document.getElementById("selectXY");
    this.select = document.getElementById("Theme_board_Select");
    this.contents = document.getElementById("contents");
    this.sendpost = document.getElementById("sendpost");
    this.XY = { x: 0, y: 0 };
  }
  DisplayMenu() {
    this.selectXY.style.display = "block";
    this.selectXY.style.cursor = "crosshair";
    this.selectXY.onmousedown = function(event){
      this.selectXY.onmousedown = null;
      this.selectXY.style.cursor = "auto";
      this.XY = {
        x: this.XY.x + event.clientX - window.innerWidth/2,
        y: this.XY.y + event.clientY - window.innerHeight/2
      }
      this.sendpost.style.display = "block";
      this.sendpost.style.left = event.clientX + "px";
      this.sendpost.style.top = event.clientY + "px";
      this.app.data.Theme_board.forEach(function(item) {
        var option = document.createElement("option");
        option.text = item.title;
        option.value = item.id;
        this.select.appendChild(option);
        }, this);
    }.bind(this);
  }
  getData() {
    var temp = {
      Theme_board : this.select.value,
      contents : this.contents.value,
      XY : {
        x : this.XY.x,
        y : this.XY.y
      }
    };
    this.reset()
    return temp;
  }
  reset(){
    if (this.select.hasChildNodes()) this.select.childNodes.forEach(x =>this.select.removeChild(x), this);
    this.contents.value = "";
    this.XY = { x: 0, y: 0 };
    this.selectXY.style.display = "None";
    this.sendpost.style.display = "None";
  }
}

class ObjectItem {
  constructor(data, removefun) {
    this.removefun = removefun;
    this.id = data.id
    this.XY = {x : data.x, y : data.y}
    this.datetime = new Date(data.datetime)
  }
  AddinnerHTML(text){
    document.getElementById("space").innerHTML += text;
  }
  getElement(){
    return document.getElementById(this.__proto__.constructor.name + "_" + this.id);
  }
  move(XY){
    var temp = this.getElement();
    temp.style.left = window.innerWidth/2 + this.XY.x - XY.x + "px";
    temp.style.top = window.innerHeight/2 + this.XY.y - XY.y + "px";
  }
}

class Theme_board extends ObjectItem {
  constructor(data, removefun) {
    super(data, removefun);
    this.title = data.title
    this.AddinnerHTML(`<div id="Theme_board_${this.id}" class="block Theme_board">${this.title}</div>\n`);
  }
}

class Post extends ObjectItem {
  constructor(data, removefun) {
    super(data, removefun);
    this.Theme_board = data.Theme_board;
    this.contents = data.contents;
    this.AddinnerHTML(`<div id="Post_${this.id}" class="block Post">${this.contents}</div>\n`);
    //this.datetime+180秒後に削除する非同期処理
    console.log( this.datetime-new Date() + 180000)
    setTimeout(function(){
      this.removefun(this);
    }.bind(this), this.datetime-new Date() + 3 * 60 * 1000);
  }
}

class MouseAction {
  constructor(block) {
    this.block = block;
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.block.onmousedown = this.onMouseDown_do.bind(this);
    this.block.onmouseup = this.onMouseUp_do.bind(this);
    this.onMouseDownAndMove = this.onMouseDownAndMove.bind(this);

    this.XYtemp = {x:0, y:0};
    this.XYdiff = {x:0, y:0};
    this.MouseMove = function(XYdiff){}.bind(this);
    this.onMouseUp = function(XYdiff){}.bind(this);
  }
  onMouseMove(event) {
    this.XYdiff.x = this.XYtemp.x - event.pageX;
    this.XYdiff.y = this.XYtemp.y - event.pageY;
    this.XYtemp.x = event.pageX;
    this.XYtemp.y = event.pageY;
  }
  onMouseDownAndMove() {
    this.MouseMove(this.XYdiff);
  }
  onMouseDown_do() {
    document.addEventListener("mousemove", this.onMouseDownAndMove);
    space.style.cursor = "move";
  }
  onMouseUp_do() {
    space.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseDownAndMove);
    this.onMouseUp();
  }
}

base = new Main();
/* 


  recv(data){
    var d = JSON.parse(data.data);
    var temp = this.funs[d.massage]
    if(temp != undefined){
      temp(d.data)
    } else {
      console.log('erorr: Not Found :' + d.massage);
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
*/