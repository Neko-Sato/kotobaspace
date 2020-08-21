const csrftoken = function (name) {
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
}('csrftoken');

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

////////////////////////////////////////////////////////////////////////////////////////////////////

class Socket {
  constructor(url, fun) {
    this.socket = new WebSocket("ws://" + window.location.host + "/websocket/" + url);
    this.socket.onmessage = function(data){ fun(JSON.parse(data.data));};
    this.socket.onopen = function() { this.send( { massage : 'test', data : {} } ) }.bind(this);
    if(this.socket.readyState == WebSocket.OPEN) this.socket.onopen();
  }
  send(data) {
    this.socket.send(JSON.stringify(data));
  }
}

//Main
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

    this.XY = {x:x, y:y};
    this.data = new SpaceData();

    this.socket = new Socket('test/', this.recv.bind(this));
    this.CreatePost = new CreatePost(this.data);
    this.MouseAction = new MouseAction(this.space);
    this.MouseAction.MouseMove = function(XYdiff){
      this.XY.x = this.XY.x + XYdiff.x;
      this.XY.y = this.XY.y + XYdiff.y;
      this.moveObjectItem();
    }.bind(this);
    this.MouseAction.onMouseUp = function(){
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
    this.socket.send({massage : 'get_sapce', data : {}});
  }
  setSpace(data){
    var alredyhadID = this.data.getIds()
    data.Theme_board = data.Theme_board.filter(x => !(alredyhadID.Theme_board.includes(x.id)));
    data.Post = data.Post.filter(x => !alredyhadID.Post.includes(x.id));
    data.Theme_board.forEach(x => this.data.Create(Theme_board, x), this);
    data.Post.forEach(x => this.data.Create(Post, x), this);
    this.moveObjectItem()
  }
  moveObjectItem() {
    this.space.style.backgroundPosition = (50/2 - this.XY.x) + "px " + (50/2 - this.XY.y) + "px";
    this.data.Move(this.XY);
  }
  CreatePostSend(){
    this.socket.send({massage : "create_post" , data : this.CreatePost.getData()})
  }
  newPost(data){
    this.data.Create(Post, data)
    this.moveObjectItem();
  }
  getRange(){
    return {
      TopLeft: {
        x: this.XY.x - window.innerWidth/2,
        y: this.XY.y - window.innerHeight/2,
      },
      BottomRight: {
        x: this.XY.x + window.innerWidth/2,
        y: this.XY.y + window.innerHeight/2,
      }
    };
  }
}

class SpaceData {
  constructor() {
    this.data = {
      Theme_board: [],
      Post: []
    }
  }
  Move(XY){
    this.data.Theme_board.forEach(x => x.move(XY), this);
    this.data.Post.forEach(x => x.move(XY), this);
  }
  Create(type, data){
    var temp = new type(data);
    this.data[type.name].push(temp);
    if(type == Post) {
      setTimeout(function(){
        this.Remove(temp);
      }.bind(this), temp.datetime-new Date() + 30 * 1000);
    };
  }
  Remove(arg){
    arg.getElement().remove();
    this.data[arg.__proto__.constructor.name] = this.data[arg.__proto__.constructor.name].filter(x => x != arg);
  }
  getIds(){
    return {
      Theme_board: this.data.Theme_board.map(x => x.id),
      Post: this.data.Post.map(x => x.id)
    }
  }
}

class CreatePost {
  constructor(data){
    this.data = data;
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
      this.data.data.Theme_board.forEach(function(item) {
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
  constructor(data) {
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
  constructor(data) {
    super(data);
    this.title = data.title
    this.AddinnerHTML(`<div id="Theme_board_${this.id}" class="block Theme_board">${this.title}</div>\n`);
  }
}

class Post extends ObjectItem {
  constructor(data) {
    super(data);
    this.Theme_board = data.Theme_board;
    this.contents = data.contents;
    this.AddinnerHTML(`<div id="Post_${this.id}" class="block Post">${this.contents}</div>\n`);
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