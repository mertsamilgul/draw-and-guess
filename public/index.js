/*
- time progress bar (bootstrap)
- responsive
- add color selection
- score table?
- auto scroll to bottom
*/

var canvas,ctx, mouse_down = false;
var drawing=false;
var size = 6;
var loc = [0,0,0,0,"black"];

/*
loc[]
0 - previous X
1 - previous Y
2 - current X
3 - current Y
4 - color
*/

function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    width = canvas.width;
    height = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(loc[0], loc[1]);
    ctx.lineTo(loc[2], loc[3]);
    ctx.strokeStyle = loc[4];
    ctx.lineWidth = size;
    ctx.stroke();
    ctx.closePath();
}

function clear_screen() {
    ctx.clearRect(0, 0, width, height);
}

function findxy(mouse, e) {
    if(drawing){

        if(mouse == 'down'){
            loc[0] = loc[2];
            loc[1] = loc[3];
            loc[2] = e.clientX - canvas.offsetLeft;
            loc[3] = e.clientY - canvas.offsetTop;

            mouse_down = true;

            ctx.beginPath();
            ctx.fillStyle = loc[4];
            ctx.fillRect(loc[2],loc[3], 2, 2);
            ctx.closePath();
        }
        if(mouse == 'up' || mouse == "out"){
            mouse_down = false;
        }
        if(mouse == 'move'){
            if(mouse_down){
                loc[0] = loc[2];
                loc[1] = loc[3];
                loc[2] = e.clientX - canvas.offsetLeft;
                loc[3] = e.clientY - canvas.offsetTop;
                socket.emit('draw',room,username,loc);
                console.log('draw');
                draw();
            }
        }
    }
}

function color_change(color)
{
    loc[4] = color;
}
////////////////////////////////////////////////
const room_no = document.getElementById('room-no');
const mbox = document.getElementById("message-box");
const username = prompt("isim giriniz?","Drawer#" + (Math.floor(Math.random() * 1000)));
const tbox = document.getElementById('text-box');

var room=null;

const socket = io();

socket.on('connect', () => {});

socket.on('joined', (room_id) => {
    room = room_id;
    room_no.innerText = "ÇİZANLAT"; // room number
    socket.emit('joined',room_id,username); 
});

socket.on('message_back', (username_,message) => {
    add_message(username_,message)
});

socket.on('draw',(username_,loc_) => {
    if(username != username_){
        loc = loc_
        draw();
    }
});

socket.on('drawing',(username_) => {
    if(username != username_)
        drawing=false;
    else
        drawing=true;
    
    clear_screen();
});

tbox.addEventListener("keyup", function(event){
    if(event.keyCode === 13){
        event.preventDefault();

        var message = tbox.value;
        if(message != ""){
            socket.emit('message',room,username,message);
            tbox.value = "";
        }
    }
});

function add_message(user,message)
{
    var bold = document.createElement('b');
    bold.innerText = user + ": ";
    var msg = document.createElement('ins');
    msg.innerText = message
    mbox.appendChild(bold);
    mbox.appendChild(msg);
    mbox.appendChild(document.createElement('br'))
}