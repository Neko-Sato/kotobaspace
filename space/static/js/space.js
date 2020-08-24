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
  constructor(x = 0, y = 0) {
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

    window.addEventListener("resize", function(){ this.getSpace.bind(this); }.bind(this));
    this.socket.socket.onopen = function(){ this.getSpace(); }.bind(this);
  }
  recv(data){
    console.log(data);
    if(data.massage == 'set_space'){
      this.setSpace(data.data);
    } else if(data.massage == 'new_post'){
      this.newPost(data.data);
    }
  }
  getSpace(datetime = new Date().toISOString()){
    this.socket.send({massage : 'set_range', data : this.getRange()});
    this.socket.send({massage : 'get_sapce', data : {datetime : datetime}});
  }
  setSpace(data){
    var alredyhadID = this.data.getIds()
    data.Post = data.Post.filter(x => !alredyhadID.Post.includes(x.id));
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
      Post: []
    }
  }
  Move(XY){
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
      Post: this.data.Post.map(x => x.id)
    }
  }
}

class CreatePost {
  constructor(data){
    this.data = data;
    this.space = document.getElementById("space");
    this.selectXY = document.getElementById("selectXY");
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
    }.bind(this);
  }
  getData() {
    var temp = {
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
    this.contents.value = "";
    this.XY = { x: 0, y: 0 };
    this.selectXY.style.display = "None";
    this.sendpost.style.display = "None";
  }
}

class ObjectItem {
  constructor(data) {
    this.id = data.id;
    this.XY = data.XY;
    this.datetime = new Date(data.datetime);
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

class Post extends ObjectItem {
  constructor(data) {
    super(data);
    this.user = data.user;
    this.Theme_board = data.Theme_board;
    this.contents = data.contents;
    this.AddinnerHTML(`<div id="Post_${this.id}" class="block Post">${this.user.str}${this.contents}</div>\n`);
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
    var temp = {x:event.pageX, y:event.pageY};
    this.XYdiff.x = this.XYtemp.x - temp.x;
    this.XYdiff.y = this.XYtemp.y - temp.y;
    this.XYtemp = temp;
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