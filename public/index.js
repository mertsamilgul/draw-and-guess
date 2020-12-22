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
    canvas = document.getElementById('canvas');
    cpicker = document.getElementById("color-picker");
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

    cpicker.addEventListener("change", color_pick, false);
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

function color_pick(event) {
    loc[4] = event.target.value;
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

function color_change(color){
    loc[4] = color;
}

////////////////////////////////////////////////
const room_no = document.getElementById('room-no');
const mbox = document.getElementById("message-box");
const room = prompt("Room ID:",0);
const username = prompt("Username?","Drawer#" + (Math.floor(Math.random() * 1000)));
const tbox = document.getElementById('text-box');
const pbar = document.getElementById("prog-bar");
const plist = document.getElementById("player-list");
var user_id = null;

const socket = io();

socket.on('connect', () => {
    socket.emit('joined',room,username);
});

socket.on('joined',(uid) => {
    user_id = uid;
});

socket.on('deneme', (arr) => {
    
    console.log(arr);
    for(i in arr)
        console.log("bu" + arr[i]);
});

socket.on('message', (username_,message) => {
    add_message(username_,message)
});

socket.on('draw',(username_,loc_) => {
    if(loc_ == -1)
        ctx.clearRect(0, 0, width, height);
    else if(username != username_){
        loc = loc_
        draw();
    }
});

socket.on('drawing',(username_) => {
    if(username != username_)
        drawing=false;
    else
        drawing=true;
    
    ctx.clearRect(0, 0, width, height);
});

socket.on('progress',(seconds) => {

    pbar.style.width = seconds + "%";
});

socket.on('update_players',(players) => {

    for(i in players)
    {
        player = document.getElementById(players[i][0]);

        if(!player){
            player = document.createElement('a');
            player.id = players[i][0];
            plist.appendChild(player);
        }
        
        player.innerText = players[i][0] + " : " + players[i][1];
    }
    

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

function clear_screen(){
    if(drawing)
        socket.emit('draw',room,username,-1);
}