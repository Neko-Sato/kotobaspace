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
 
function csrfSafeMethod(method) {
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function send_data(url_input, data_input){
  $.ajax({
    type: "POST",
    url: url_input,
    data: data_input, 
    contentType: "application/json",
    beforeSend: function(xhr, settings) {
         if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
             xhr.setRequestHeader("X-CSRFToken", csrftoken);
         }
      },
  });
}

var header = document.getElementById("header");
var hooder = document.getElementById("hooder");
var space = document.getElementById("space");

window_load();

var xy = pxy = qxy = [0, 0];
var is_fast = true;

space.onmousedown = onmousedown_do;
space.onmouseup = onmouseup_do;
window.onresize = window_load;

function window_load() {
  space.style.height = window.innerHeight + 'px'; 
  space.style.Width = window.innerWidth + 'px';  
  header.style.Width = window.innerWidth + 'px';  
  hooder.style.Width = window.innerWidth + 'px'; 
}  

function onmousedown_do() {
  space.style.cursor = "grabbing";
  document.addEventListener("mousemove",onMouseMove);
}

function onmouseup_do() {
  qxy = [0, 0];
  is_fast = true;
  space.style.cursor = "auto"; 
  document.removeEventListener("mousemove",onMouseMove)
}

function onMouseMove(event) {
  pxy = [event.clientX, event.clientY];
  if(is_fast){
    qxy = pxy;
    is_fast = false
  }
  xy = [xy[0] + (pxy[0] - qxy[0]), xy[1] + (pxy[1] - qxy[1])]
  send_data("postget/", {"x" : xy[0], "y" : xy[1]});
  qxy = pxy
}

function display_block_change(){
  space.innerHTML = ""
  space.innerHTML += "<div id=\"block\">" + "" + "<div>\n"
}