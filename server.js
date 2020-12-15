var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

var port = process.env.PORT || 8080;

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

var drawn = null;
var now_drawing = false;

var room_id = "main0";
// rooms can be modified

io.on('connection', function (socket) {
    socket.join(room_id);
    socket.emit('joined',room_id);

    socket.on('joined',(room,username) => {
        io.to(room).emit('message_back',"[SERVER]",username + " joined!");
    });

    socket.on('message',(room,username,message) => {

        console.log(room,username,message);
        if(now_drawing && drawn == message){
            io.to(room).emit('message_back',"[SERVER]",username +" found it!");
            now_drawing = false;

        }
        else if(message.charAt(0) != '/')
            io.to(room).emit('message_back',username,message);
        else if(!now_drawing && message.charAt(0) == '/'){
            drawn = message.substring(1);
            now_drawing = true;
            io.to(room).emit('drawing',username);
            io.to(room).emit('message_back',"[SERVER]",username + " is drawing!");
        }
        else if(message == "/amdin"){
            now_drawing = false;
            io.to(room).emit('message_back',"[SERVER]","Tur İptal");
        }
    });

    socket.on('draw',(room,username,loc) => {
        io.to(room).emit('draw',username,loc);
    });
});

http.listen(port);