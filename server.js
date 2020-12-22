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

var user = [];
var players = [];
var found = [];
var timer = [];
var drawn = null;
var now_drawing = false;
var seconds=0;

function players_arr(players){

    var arr = [];

    for(i in players)
        arr.push([i,players[i]]);

    return arr;
}



io.on('connection', function (socket) {

    socket.on('joined',(room,user_name) => {

        socket.join(room);
        io.to(room).emit('message', "[SERVER]", user_name + " joined!");

        if(room && user_name){
            user[socket.id] = [room,user_name];

            if(!players[room])
                players[room] = [];
            
            players[room][user_name] = 0;

            io.to(room).emit('update_players',players_arr(players[room]));
        }
    });

    socket.on('disconnect', function() {

        if(user[socket.id]){

            room = user[socket.id][0];
            user_name = user[socket.id][1];

            io.to(room).emit('message',"[SERVER]",user_name + " left!");
    
            delete players[room][user_name];
            delete user[socket.id];

            io.to(room).emit('update_players',players_arr(players[room]));
        }
        
    });

    socket.on('message',(room,user_name,message) => {

        if(now_drawing && drawn == message){

            io.to(room).emit('message',"[SERVER]",user_name + " +" +(100-seconds));

            players[room][user_name] += 100-seconds;

            io.to(room).emit('update_players',players_arr(players[room]));

            clearInterval(timer[room]);
            now_drawing = false;
        }
        else if(message.charAt(0) != '/'){
            io.to(room).emit('message',user_name,message);
        }
        else if(!now_drawing && message.charAt(0) == '/'){

            found[room] = 0;

            drawn = message.substring(1);
            now_drawing = true;
            found=0;
            io.to(room).emit('drawing',user_name);
            io.to(room).emit('message',"[SERVER]",user_name + " is drawing!");

            seconds=0;

            timer[room] = setInterval(function() {

                io.to(room).emit('progress',seconds);
                seconds++;
                if(seconds==100){

                    io.to(room).emit('message',"[SERVER]","Time Out!");
                    now_drawing = false;
                    clearInterval(timer[room]);
                }
            }, 1000);
        }
    });

    socket.on('draw',(room,user_name,loc) => {
        io.to(room).emit('draw',user_name,loc);
    });
});

http.listen(port);