var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var baseDir = __dirname.slice(0,__dirname.lastIndexOf('/'))+"/tanktrouble";

app.use("/assets",express.static(baseDir+"/assets"));
app.use("/css",express.static(baseDir+"/css"));
app.use("/external",express.static(baseDir+"/external"));
app.use("/js",express.static(baseDir+"/js"));
app.use("/node_modules",express.static(baseDir+"/node_modules"));

app.get('/', function(req, res){
    res.sendFile('/index.html',{root:baseDir});
    req.resume();
});

var players=[];

function addNewPlayer(socket){
    console.log('a user connected');
    players.push(socket);
    socket.on('playerMove',(moveData)=>{
        console.log("playermove");
        socket.broadcast.emit("playerMove",moveData);
    });
    socket.on('disconnect', function(){
        let indx = players.indexOf(socket);
        players.splice(indx,1);
        // if(players.length==0){
        //     io.close();
        // }
        console.log('a user disconnected');
    });
}

io.on('connection', function(socket){
    addNewPlayer(socket);
});

http.listen(8089, function(){
  console.log('listening on *:8089');
});

process.on('uncaughtException', function (exception) {
    // handle or ignore error
    debugger;
    console.log(exception);
});