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
    this.window_load();
    window.addEventListener("resize", this.window_load.bind(this));
    window.addEventListener("resize", this.move_data.bind(this));
    this.communication = new communication('../../space/postget/', this.outputData.bind(this));
    this.data = {
      'Theme_board':[],
      'Post':[]
    };
    this.getData()
  }
  window_load() {
    this.space.style.height = window.innerHeight + 'px';
    this.space.style.Width = window.innerWidth + 'px';
    this.header.style.Width = window.innerWidth + 'px';
    this.hooder.style.Width = window.innerWidth + 'px';
  }
  getRange() {
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
      this.space.innerHTML += `<div id="Theme_board_${item.id}" class="block Theme_board">${item.title}</div>\n`;
    }.bind(this))
    data.Post.forEach(function(item) {
      this.space.innerHTML += `<div id="Post_${item.id}" class="block Post">${item.contents}</div>\n`;
    }.bind(this))
    this.move_data();
  }
  move_data() {
    this.space.style.backgroundPosition = (50/2 - this.XY.x) + "px " + (50/2 - this.XY.y) + "px";
    this.data.Theme_board.forEach(function(item) {
      var temp = document.getElementById("Theme_board_" + item.id);
      temp.style.left = window.innerWidth/2 + item.x - this.XY.x + "px";
      temp.style.top = window.innerHeight/2 + item.y - this.XY.y + "px";
    }.bind(this));
    this.data.Post.forEach(function(item) {
      var temp = document.getElementById("Post_" + item.id);
      temp.style.left = window.innerWidth/2 + item.x - this.XY.x + "px";
      temp.style.top = window.innerHeight/2 + item.y - this.XY.y + "px";
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
    this.display.move_data()
  }
  onMouseDown_do() {
    document.addEventListener("mousemove", this.onMouseDownAndMove);
    space.style.cursor = "move";
  }
  onMouseUp_do() {
    space.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseDownAndMove);
    this.display.getData()
    //this.display.remove_data()
    history.replaceState('','','/space/@' + this.display.XY.x + "," + this.display.XY.y);
  }
}

//フッダーに投稿のhtmlを追加する
