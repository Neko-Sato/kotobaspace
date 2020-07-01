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
    this.xhr.send(data);
  }
}

//htmlのやつ
var space = document.getElementById("space");
var header = document.getElementById("header");
var hooder = document.getElementById("hooder");

//情報
var data =  {
  'Theme_board':[],
  'Post':[]
}

//情報の追加と削除
function create_data(d){
  Array.prototype.push.apply(data.Theme_board, d.Theme_board);
  Array.prototype.push.apply(data.Post, d.Post);
  d.Theme_board.forEach(function(item) {
    space.innerHTML += `<div id="Theme_board_${item.id}" class="block Theme_board">${item.title}</div>\n`;
    temp = document.getElementById("Theme_board_" + item.id);
    temp.style.left = parseInt(window.innerWidth/2 + item.x - XY[0]) + "px";
    temp.style.top = parseInt(window.innerHeight/2 + item.y - XY[1]) + "px";
  });
  d.Post.forEach(function(item) {
    space.innerHTML += `<div id="Post_${item.id}" class="block Post">${item.contents}</div>\n`;
    temp = document.getElementById("Post_" + item.id);
    temp.style.left = parseInt(window.innerWidth/2 + item.x - XY[0]) + "px";
    temp.style.top = parseInt(window.innerHeight/2 + item.y - XY[1]) + "px";
  });
}
function remove_data(d){
  d.Theme_board.forEach(function(item) {
    document.getElementById("Theme_board_" + item.id).remove();
  });
  d.Post.forEach(function(item) {
    document.getElementById("Post_" + item.id).remove();
  });
  daata.Theme_board = data.Theme_board.filter(i => d.Theme_board.indexOf(i) == -1);
  daata.Post = data.Post.filter(i => d.Post.indexOf(i) == -1);
}
function move_data(xy){
  data.Theme_board.forEach(function(item) {
    temp = document.getElementById("Theme_board_" + item.id);
    temp.style.left = parseInt(window.innerWidth/2 + item.x - XY[0]) + "px";
    temp.style.top = parseInt(window.innerHeight/2 + item.y - XY[1]) + "px";
  });
  data.Post.forEach(function(item) {
    temp = document.getElementById("Post_" + item.id);
    temp.style.left = parseInt(window.innerWidth/2 + item.x - XY[0]) + "px";
    temp.style.top = parseInt(window.innerHeight/2 + item.y - XY[1]) + "px";
  });
}

//情報を取得
const get_data = new communication('postget/', create_data);
get_data.send(JSON.stringify({
  range: [{
    TopLeft: {
      x: XY[0] - window.innerWidth/2,
      y: XY[1] - window.innerHeight/2,
      },
    BottomRight: {
      x: XY[0] + window.innerWidth/2,
      y: XY[1] + window.innerHeight/2,
    },
  }],
  alredyhadID: {
    Theme_board: [],
    Post: []
  }
}));

//差分を収得

//マウス操作について
document.addEventListener("mousemove",　onMouseMove);

var MouseXY_diff = [0, 0];
var MouseXY_temp = [0, 0];
function onMouseMove (event) {
  MouseXY_diff = [MouseXY_temp[0] - event.pageX, MouseXY_temp[1] - event.pageY];
  MouseXY_temp = [event.pageX, event.pageY];
}

class MouseAction{
  onMouseMove() {
    XY = [XY[0] + MouseXY_diff[0], XY[1] + MouseXY_diff[1]];
    move_data(MouseXY_diff);
  }
  onmousedown_do() {
    document.addEventListener("mousemove", this.onMouseMove);
    space.style.cursor = "move";
  }
  onmouseup_do() {
    space.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseMove);
    history.replaceState('','','/space/@' + XY[0] + "," + XY[1]);
  }
}

var mouseaction = new MouseAction();
space.onmousedown = function(){mouseaction.onmousedown_do();};
space.onmouseup = function(){mouseaction.onmouseup_do();};
window.onresize = window_load;

window_load();

function window_load() {
  space.style.height = window.innerHeight + 'px';
  space.style.Width = window.innerWidth + 'px';
  header.style.Width = window.innerWidth + 'px';
  hooder.style.Width = window.innerWidth + 'px';
  move_data([0, 0]);
}

//更新があったら読み込み直す