var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
const bodyParser = require("body-parser");

var baseDir = __dirname.slice(0, __dirname.lastIndexOf(path.sep)) + path.sep + "tanktrouble";
var port = 8080;

app.use("/assets", express.static(baseDir + "/assets"));
app.use("/css", express.static(baseDir + "/css"));
app.use("/external", express.static(baseDir + "/external"));
app.use("/js", express.static(baseDir + "/js"));
app.use("/node_modules", express.static(baseDir + "/node_modules"));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile('/index.html', { root: baseDir });
    req.resume();
});

app.get('/gameRoom', function (req, res) {
    console.log("gameRoom");
    res.sendFile('/startGame.html', { root: baseDir });
    req.resume();
});

app.post("/login", function (req, res) {
    console.log('POST request to login');
    players.push(new Player(req.body.id, req.body.email, req.body.email));
    res.send(JSON.stringify({
        id: req.body.id,
        goTo: "gameRoom"
    }));
    res.end();
})

io.on('connection', function (socket) {
    socket.join(`game${games.length+1}`);
    addNewPlayer(socket);
    if (players.length == 2) {
        var game = new Game(games.length+1)
        games.push(game);
        io.to(`game${game.id}`).emit("gridReady",game.getGridInfo());
    }
});

process.on('uncaughtException', function (exception) {
    // handle or ignore error
    debugger;
    console.log(exception);
});

// CONSTANTS
var players = [];
var games = [];
/// FUNCTIONS

function addNewPlayer(socket) {
    console.log('a user connected');
    socket.on('playerMove', (moveData) => {
        console.log("playermove");
        socket.broadcast.emit("playerMove", moveData);
    });
    socket.on('disconnect', function () {
        console.log('a user disconnected');
    });
}
//GRID

var Player = function (id, email, name) {
    var self = this;
    this.id = id;
    this.email = email;
    this.name = name;
    this.isReady = false;
}

var Game = function (id) {
    var self = this;
    this.grid = null;
    this.id = id;
    this.maxHlines = 5;
    this.maxVlines = 8;
    this.arenaHeight = 500;
    this.arenaWidth = 800;
    this.wallDensity = 0.55;

    function getRandomBool() {
        return Math.random() >= self.wallDensity;
    }

    function vBound(i) {
        return i <= 0 || i >= self.maxHlines;
    }

    function hBound(j) {
        return j <= 0 || j >= self.maxVlines;
    }

    self.createGrid = function () {
        self.horGrid = new Array(self.maxHlines + 1);
        self.verGrid = new Array(self.maxHlines + 1);
        self.hLines = new Array(self.maxHlines + 1);
        self.vLines = new Array(self.maxHlines + 1);
        for (var i = 0; i < self.maxHlines + 1; i++) {
            self.horGrid[i] = new Array(self.maxVlines + 1);
            self.hLines[i] = new Array(self.maxVlines + 1);
            self.verGrid[i] = new Array(self.maxVlines + 1);
            self.vLines[i] = new Array(self.maxVlines + 1);
        }
        for (var i = 0; i < self.maxHlines + 1; i++) {
            for (var j = 0; j < self.maxVlines + 1; j++) {
                self.horGrid[i][j] = getRandomBool();
                self.verGrid[i][j] = getRandomBool();
                if (vBound(i)) self.horGrid[i][j] = true;
                if (hBound(j)) self.verGrid[i][j] = true;
            }
        }
        
    }

    self.getGridInfo = function(){
        var widthPerRect = self.arenaWidth / self.maxVlines;
        var heightPerRect = self.arenaHeight / self.maxHlines;
        return {
                horGrid: self.horGrid,
                verGrid: self.verGrid,
                hLines: self.hLines,
                vLines: self.vLines,
                widthPerRect:widthPerRect,
                heightPerRect:heightPerRect,
                maxHlines:self.maxHlines,
                maxVlines:self.maxVlines
        }
    }

    this.grid = this.createGrid();
    return this;
}

http.listen(port, function () {
    console.log(`listening on *:${port}`);
});