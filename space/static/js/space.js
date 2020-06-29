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
    this.xhr.onload = fun;
  }
  send(data){
    this.xhr.open('POST', this.url, true);
    this.xhr.setRequestHeader("X-CSRFToken", csrftoken);
    this.xhr.send(data);
  }
}

//////
//以上関数定義
//////

//送るために
const post_data = new communication('postget/', recv)

function recv(){
  console.log(post_data.xhr.responseText);
}

//ページのデザイン
var header = document.getElementById("header");
var hooder = document.getElementById("hooder");
var space = document.getElementById("space");

//マウス動作について
document.addEventListener("mousemove",　onMouseMove);

var MouseXY = [0, 0];
function onMouseMove (event) {
  MouseXY = [event.pageX, event.pageY];
}

class MouseAction{
  constructor() {
    this.MouseXY_temp = [0, 0];
  }
  onmousedown_do() {
    this.MouseXY_temp = MouseXY;
    space.style.cursor = "grabbing";
  }
  onmouseup_do() {
    var diff_XY = [this.MouseXY_temp[0] - MouseXY[0], this.MouseXY_temp[1] - MouseXY[1]];
    this.MouseXY_temp = [0, 0];
    XY = [XY[0] + diff_XY[0], XY[1] + diff_XY[1]];
    space.style.cursor = "auto"; 
  }
}

var mouseaction = new MouseAction();
space.onmousedown = mouseaction.onmousedown_do;
space.onmouseup = mouseaction.onmouseup_do;
window.onresize = window_load;

window_load();

function window_load() {
  space.style.height = window.innerHeight + 'px'; 
  space.style.Width = window.innerWidth + 'px';  
  header.style.Width = window.innerWidth + 'px';  
  hooder.style.Width = window.innerWidth + 'px'; 
}  