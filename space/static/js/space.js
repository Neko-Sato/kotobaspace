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

function GetQueryString() {
    var result = {};
    if( 1 < window.location.search.length ) {
        var query = window.location.search.substring( 1 );
        var parameters = query.split( '&' );
        for( var i = 0; i < parameters.length; i++ ) {
            var element = parameters[ i ].split( '=' );
            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );
            result[ paramName ] = paramValue;
        }
    }
    return result;
};

////////////////////////////////////////////////////////////////////////////////////////////////////

//Main
class Main {
  constructor() {
    this.space = document.getElementById("space");

    this.header = document.getElementById("header");
    this.hooder = document.getElementById("hooder");

    this.Application = function(temp){
      return new Application(
        this,
        {
          x: parseFloat((typeof temp.x == "undefined") ? 0 : temp.x),
          y: parseFloat((typeof temp.y == "undefined") ? 0 : temp.y),
        },
        (typeof temp.time == "undefined") ? 'now' : 'now',//temp.time,
      );
    }.bind(this)(GetQueryString())
  }
}

class Application {
  constructor(mother = undefined, XY = {x: 0, y: 0}, Time = 'now') {
    this.mother = mother;
    this.space = this.mother.space;

    this.XY = XY;

    if(Time == 'now'){
      this.Timedlta = 0;
    }else {
      this.Timedlta = new Date().valueOf() - new Date(Time).valueOf();
    }
    this.getTime = function(string=false){
      var temp;
      if(this.Timedlta == 0 && string){
        temp = "now";
      } else {
        temp = new Date(new Date().valueOf() - this.Timedlta);
      }
      return temp
    }.bind(this)

    this.MouseAction = new MouseAction(this.space);
    this.TouchAction = new TouchAction(this);
    this.MouseAction.MouseMove = this.TouchAction.TouchMove = function(XYdiff){
      this.XY.x = this.XY.x + XYdiff.x;
      this.XY.y = this.XY.y + XYdiff.y;
      this.moveObjectItem()
    }.bind(this);
    this.MouseAction.onMouseUp = this.TouchAction.TouchEnd = function(){
      history.replaceState('','','/space/?x=' + this.XY.x + "&y=" + this.XY.y );
    }.bind(this);

    this.data = new Data(this)

    this.socket = new Socket('test/', this.recv.bind(this));
    this.socket.socket.onopen = function(){
      this.setRange();
      this.RequestPost();
    }.bind(this)
    this.RecvFunDict = {
      OK: function(e){console.log('OK')},
      return_post: this.BringLife,
      new_post: this.newPost,
    }

    this.CreatePost = new CreatePost(this);

    setInterval(this.data.Assassination.bind(this.data), 1000);
  }
  recv(response){
    this.RecvFunDict[response.massage].bind(this)(response.data);
  }
  setRange(){
    var temp = {
      TopLeft: {
        x: this.XY.x - window.innerWidth/2,
        y: this.XY.y - window.innerHeight/2,
      },
      BottomRight: {
        x: this.XY.x + window.innerWidth/2,
        y: this.XY.y + window.innerHeight/2,
      },
      Time: this.getTime(true),
    }
    this.socket.send({massage : 'set_range', data : temp});
  }
  RequestPost(){
    this.socket.send({massage : 'request_post', data : {}});
  }
  BringLife(data){
    this.data.Add(data);
    this.moveObjectItem()
  }
  moveObjectItem() {
    this.space.style.backgroundPosition = (50/2 - this.XY.x) + "px " + (50/2 - this.XY.y) + "px";
    this.data.Move(this.XY);
  }
  CreatePostSend(temp){
    this.socket.send({massage : "create_post" , data : temp});
  }
  newPost(data){
    this.data.Create(data)
    this.moveObjectItem();
  }
}

class Data {
  constructor(mother) {
    this.mother = mother;
    this.data = { Post: [] };
  }
  getIds(){
    var temp = {}
    Object.keys(this.data).forEach(function(key){
      temp[key] = this.data[key].map(x => x.id);
    }, this);
    return temp
  }
  Add(data){
    var alredyhadID = this.getIds()
    data.Post = data.Post.filter(x => !alredyhadID.Post.includes(x.id));
    data.Post.forEach(x => this.Create(x), this);
  }
  Create(data){
    this.data.Post.push(new Post(data, this));
  }
  Remove(data){
    this.data.Post = this.data.Post.filter(x => x != data);
  }
  Move(XY){
    this.data.Post.forEach(x => x.move(XY), this);
  }
  Assassination(){
    var timetemp = this.mother.getTime()
    this.data.Post.forEach(function(temp){
      if(!(temp.datetime.valueOf()-30000 <= timetemp.valueOf() &&
      timetemp.valueOf() < temp.datetime.valueOf() + 30000)){
        temp.Remove();
      }
    }, this);
  }
}

class Post {
  constructor(data, mother) {
    this.mother = mother;
    this.id = data.id;
    this.XY = data.XY;
    this.datetime = new Date(data.datetime);
    this.user = data.user;
    this.contents = data.contents;

    this.el = document.createElement("div");
    this.el.id = "Post_" + this.id;
    this.el.className = "block Post";
    this.el.innerHTML = "【" + this.user.str + "】" + this.contents;
    this.mother.mother.space.appendChild(this.el)
  }
  move(XY){
    this.el.style.left = window.innerWidth/2 + this.XY.x - XY.x + "px";
    this.el.style.top = window.innerHeight/2 + this.XY.y - XY.y + "px";
  }
  Remove(){
    this.mother.mother.space.removeChild(this.el);
    this.mother.Remove(this);
  }
}

class CreatePost {
  constructor(mother){
    this.mother = mother;
    this.space = this.mother.space;
    this.selectXY = document.getElementById("selectXY");
    this.sendpost = undefined;
  }
  InputMenu(XY = { x: 0, y: 0 }) {
    var sendpost = document.createElement("form");
    sendpost.onsubmit = function(){return false}
    sendpost.id = "sendpost"
    sendpost.appendChild(function(){
      var contents = document.createElement("input");
      contents.type = "text";
      contents.id = "contents";
      contents.value = "";
      return contents
    }.bind(this)());
    sendpost.appendChild(function(){
      var send = document.createElement("input");
      send.type = "button";
      send.id = "send";
      send.value = "送信";
      send.addEventListener('click', function(event){
        this.mother.CreatePostSend({
          contents : contents.value,
          XY : {
            x : this.mother.XY.x + XY.x - window.innerWidth/2,
            y : this.mother.XY.y + XY.y - window.innerHeight/2
          }
        });
        this.reset()
      }.bind(this));
      return send
    }.bind(this)());
    sendpost.appendChild(function(){
      var back = document.createElement("input");
      back.type = "button";
      back.id = "back";
      back.value = "戻る";
      back.addEventListener('click', function(event){
        this.reset()
      }.bind(this));
    return back
    }.bind(this)());
    sendpost.style.left = XY.x + "px";
    sendpost.style.top = XY.y + "px";
    return sendpost;
  }
  DisplayMenu() {
    this.selectXY.style.display = "block";
    this.selectXY.style.cursor = "crosshair";
    this.selectXY.onmousedown = function(event){
      this.selectXY.onmousedown = undefined;
      this.selectXY.style.cursor = "auto";
      this.sendpost = this.InputMenu({
        x: event.clientX,
        y: event.clientY
      });
      this.selectXY.appendChild(this.sendpost);
    }.bind(this);
  }
  reset(){
    this.selectXY.style.display = "None";
    this.selectXY.removeChild(this.sendpost);
    this.sendpost = undefined;
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
    this.MouseMove = function(XYdiff){};
    this.onMouseUp = function(XYdiff){};
  }
  onMouseMove(event) {
    var temp = {x:event.pageX, y:event.pageY};
    this.XYdiff.x = this.XYtemp.x - temp.x;
    this.XYdiff.y = this.XYtemp.y - temp.y;
    this.XYtemp = temp;
  }
  onMouseDownAndMove(event) {
    this.MouseMove(this.XYdiff);
  }
  onMouseDown_do(event) {
    document.addEventListener("mousemove", this.onMouseDownAndMove);
    this.block.style.cursor = "move";
  }
  onMouseUp_do(event) {
    this.block.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseDownAndMove);
    this.onMouseUp();
  }
}

class TouchAction {
  constructor(mother) {
    this.mother = mother;
    this.block = mother.space;

    this.block.ontouchstart = this.onTouchStart_do.bind(this);

    this.XYtemp = {x:0, y:0};
    this.XYdiff = {x:0, y:0};

    this.TouchMove = function(XYdiff){};
    this.TouchEnd = function(XYdiff){};
  }
  onTouchStart_do(event){
    if(event.changedTouches.length==1){
      this.XYtemp = {x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY};
      document.addEventListener("touchmove", this.onTouchMove_do.bind(this));
    }else{
      document.removeEventListener("touchmove", this.onTouchMove_do.bind(this));
      this.onTouchEnd_do();
    }
  }
  onTouchMove_do(event){
    if(event.changedTouches.length==1){
      document.addEventListener("touchend", this.onTouchEnd_do.bind(this));
      var temp = {x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY};
      this.XYdiff.x = parseInt(this.XYtemp.x - temp.x);
      this.XYdiff.y = parseInt(this.XYtemp.y - temp.y);
      this.XYtemp = temp;
      this.TouchMove(this.XYdiff);
    }else{
      this.onTouchEnd_do();
    }
  }
  onTouchEnd_do(){
    document.removeEventListener("touchend", this.onTouchEnd_do.bind(this));
    this.TouchEnd();
  }
}


base = new Main();