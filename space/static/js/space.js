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

(function() {
  var noScroll = e => e.preventDefault();
  document.addEventListener('touchmove', noScroll, { passive: false });
  document.addEventListener('mousewheel', noScroll, { passive: false });
  document.removeEventListener('touchmove', noScroll, { passive: false });
  document.removeEventListener('mousewheel', noScroll, { passive: false });
})();

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
    this.timedisplay = document.getElementById("time");

    this.Application = function(temp){
      return new Application(
        this,
        {
          x: parseFloat((typeof temp.x == "undefined") ? 0 : temp.x),
          y: parseFloat((typeof temp.y == "undefined") ? 0 : temp.y),
        },
        (new Date(temp.time) == "Invalid Date") ? 'now' : new Date(temp.time),
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
      this.Timedlta = new Date().valueOf() - Time.valueOf();
    }
    this.getTime = function(string=false){
      var temp = new Date(new Date().valueOf() - this.Timedlta);
      if(string){
        if(this.Timedlta == 0){
          temp = "now";
        }else{
          temp = temp.toISOString()
        }
      }
      return temp
    }.bind(this)

    setInterval(function(time){
      this.mother.timedisplay.innerHTML = this.getTime();
    }.bind(this),1000);

    this.MouseAction = new MouseAction(this.space);
    this.TouchAction = new TouchAction(this.space);
    this.MouseAction.Move = this.TouchAction.Move = function(XYdiff){
      this.XY.x = this.XY.x + XYdiff.x;
      this.XY.y = this.XY.y + XYdiff.y;
      this.moveObjectItem()
    }.bind(this);
    this.MouseAction.End = this.TouchAction.End = function(){
      history.replaceState('','','/space/?x=' + this.XY.x + "&y=" + this.XY.y + "&time=" + this.getTime(true));
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
    setInterval(this.Assassination.bind(this), 1000);
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

class Action {
  constructor(block) {
    this.block = block;

    //**************** = this.onStart_do.bind(this);
    this.onEnd_do_bind = this.onEnd_do.bind(this);
    //this.even_type_End = "";
    this.onMove_do_bind = this.onMove_do.bind(this);
    //this.even_type_Move = "";

    this.XYtemp = {x:0, y:0};
    this.XYdiff = {x:0, y:0};

    this.Move = function(XYdiff){};
    this.End = function(){};
  }
  onStart_do(XY){
    this.XYtemp = XY;
    this.block.addEventListener(this.even_type_Move, this.onMove_do_bind);
  }
  onMove_do(XY){
    this.block.addEventListener(this.even_type_End, this.onEnd_do_bind);
    var temp = XY;
    this.XYdiff.x = parseInt(this.XYtemp.x - temp.x);
    this.XYdiff.y = parseInt(this.XYtemp.y - temp.y);
    this.XYtemp = temp;
    this.Move(this.XYdiff);
  }
  onEnd_do(){
    this.block.removeEventListener(this.even_type_End, this.onEnd_do_bind);
    this.block.removeEventListener(this.even_type_Move, this.onMove_do_bind);
    this.End();
  }
}
class MouseAction extends Action {
  constructor(block) {
    super(block);
    this.block.onmousedown = this.onStart_do.bind(this);
    this.even_type_End = "mouseup";
    this.even_type_Move = "mousemove";
  }
  onStart_do(event){
    this.block.style.cursor = "move";
    super.onStart_do({x:event.pageX, y:event.pageY});
  }
  onMove_do(event){
    super.onMove_do({x:event.pageX, y:event.pageY});
  }
  onEnd_do(){
    this.block.style.cursor = "auto";
    super.onEnd_do();
  }
}

class TouchAction extends Action {
  constructor(block) {
    super(block);
    this.block.ontouchstart = this.onStart_do.bind(this);
    this.even_type_End = "touchend";
    this.even_type_Move = "touchmove";
  }
  onStart_do(event){
    if(event.changedTouches.length==1){
      super.onStart_do({x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY});
    }else{
      this.onEnd_do();
    }
  }
  onMove_do(event){
    if(event.changedTouches.length==1){
      super.onMove_do({x:event.changedTouches[0].pageX, y:event.changedTouches[0].pageY});
    }else{
      this.onEnd_do();
    }
  }
  onEnd_do(){
    this.block.style.cursor = "auto";
    super.onEnd_do();
  }
}

var base = new Main();