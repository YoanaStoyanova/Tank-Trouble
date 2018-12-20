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
    players[req.body.id] = new Player(req.body.id, req.body.email, req.body.name);
    res.send(JSON.stringify({
        id: req.body.id,
        goTo: "gameRoom"
    }));
    res.end();
})

io.on('connection', function (socket) {
    console.log('a user connected');
    addNewPlayer(socket);
    if (Object.keys(players).length % 2 == 0) {
        games.push(new Game(games.length + 1));
    }
});

process.on('uncaughtException', function (exception) {
    // handle or ignore error
    debugger;
    console.log(exception);
});

// CONSTANTS
var players = {};
var games = [];

/// FUNCTIONS
function addNewPlayer(socket) {
    socket.on('playerReady', function (playerId) {
        var freeGame = games.find(function (g) { return g.isFull() == false; });
        socket.join(freeGame.id);
        var player = players[playerId];
        player.setSocket(socket);
        freeGame.addNewPlayer(player);
    });

    socket.emit("gridReady", game.getGridInfo());
}
//GRID

var Player = function (id, email, name) {
    var self = this;
    this.id = id;
    this.email = email;
    this.name = name;
    this.socket = null;
    this.isReady = false;

    self.setSocket = function (socket) {
        self.socket = socket;
        this.isReady = true;
    }
}

var Game = function (id) {
    var self = this;
    this.state = "waitingPlayers";
    this.grid = null;
    this.id = "game" + id;
    this.maxHlines = 5;
    this.maxVlines = 8;
    this.arenaHeight = 500;
    this.arenaWidth = 800;
    this.wallDensity = 0.55;
    this.connectedList = [];
    this.horGrid = [];
    this.verGrid = [];
    this.hLines = [];
    this.vLines = [];
    this.dfsGrid = [];
    this.players = [];

    function getRandomBool() {
        return Math.random() >= self.wallDensity;
    }

    function vBound(i) {
        return i <= 0 || i >= self.maxHlines;
    }

    function hBound(j) {
        return j <= 0 || j >= self.maxVlines;
    }

    function _addNewPlayer(player){
        var socket = player.socket;
        socket.on('playerMove', (moveData) => {
            socket.to(self.id).emit('playerMove', moveData);
        });
    
        socket.on('disconnect', function () {
            // game.removePlayer(socket);
            console.log('a user disconnected');
        });
    
        socket.on('leave', function () {
            game.removePlayer(socket);
            console.log('a user disconnected');
        });
    
        socket.on('fireBullet', function () {
            socket.to(game.id).emit("fireBullet");
        });
    
        socket.on('playerName', function (name) {
            game.setPlayerName(socket.id, name);
        });
    }

    function startGameIfFull(){
        if(self.players.length < 2) return
        self.state = "running";
        self.players[0].socket.emit("playersReady",self.players[1].name);
        self.players[1].socket.emit("playersReady",self.players[0].name);
    }

    self.addNewPlayer = function (player) {
        _addNewPlayer(player);
        self.players.push(player);
        player.socket.emit("playerId", self.players.length)
        startGameIfFull();
    }

    self.removePlayer = function (socket) {
        var index = self.players.find(s => socket.id == s.id);
        self.players.splice(index, 1);
    }

    self.setPlayerName = function (socketId, name) {

    }

    self.isFull = function () {
        return self.players.length == 2 ? true : false;
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
        self.ensureConnectivity();
    }

    self.getGridInfo = function () {
        var widthPerRect = self.arenaWidth / self.maxVlines;
        var heightPerRect = self.arenaHeight / self.maxHlines;
        return {
            arenaWidth: self.arenaWidth,
            arenaHeight: self.arenaHeight,
            horGrid: self.horGrid,
            verGrid: self.verGrid,
            hLines: self.hLines,
            vLines: self.vLines,
            widthPerRect: widthPerRect,
            heightPerRect: heightPerRect,
            maxHlines: self.maxHlines,
            maxVlines: self.maxVlines
        }
    }

    self.dfs = function (i, j, k) {
        if (self.dfsGrid[i][j] !== -1) return;

        self.dfsGrid[i][j] = k;
        if (!vBound(i + 1) && !self.horGrid[i + 1][j]) {
            self.dfs(i + 1, j, k);
        }
        if (!vBound(i) && !self.horGrid[i][j]) {
            self.dfs(i - 1, j, k);
        }
        if (!hBound(j + 1) && !self.verGrid[i][j + 1]) {
            self.dfs(i, j + 1, k);
        }
        if (!hBound(j) && !self.verGrid[i][j]) {
            self.dfs(i, j - 1, k);
        }
    }

    self.ddfs = function (i, j) {
        if (self.dfsGrid[i][j] === -1) return;

        self.dfsGrid[i][j] = -1;
        if (!vBound(i + 1)) {
            if (self.horGrid[i + 1][j] && self.connectedList.indexOf(self.dfsGrid[i + 1][j]) === -1) {
                self.horGrid[i + 1][j] = false;
                self.connectedList.push(self.dfsGrid[i + 1][j]);
            }
            self.ddfs(i + 1, j);
        }
        if (!vBound(i)) {
            if (self.horGrid[i][j] && self.connectedList.indexOf(self.dfsGrid[i - 1][j]) === -1) {
                self.horGrid[i][j] = false;
                self.connectedList.push(self.dfsGrid[i - 1][j]);
            }
            self.ddfs(i - 1, j);
        }
        if (!hBound(j + 1)) {
            if (self.verGrid[i][j + 1] && self.connectedList.indexOf(self.dfsGrid[i][j + 1]) === -1) {
                self.verGrid[i][j + 1] = false;
                self.connectedList.push(self.dfsGrid[i][j + 1]);
            }
            self.ddfs(i, j + 1);
        }
        if (!hBound(j)) {
            if (self.verGrid[i][j] && self.connectedList.indexOf(self.dfsGrid[i][j - 1]) === -1) {
                self.verGrid[i][j] = false;
                self.connectedList.push(self.dfsGrid[i][j - 1]);
            }
            self.ddfs(i, j - 1);
        }
    }

    self.checkConnectivity = function () {
        self.dfsGrid = new Array(self.maxHlines);
        for (var i = 0; i < self.maxHlines; i++)
            self.dfsGrid[i] = new Array(self.maxVlines);
        for (var i = 0; i < self.maxHlines; i++) {
            for (var j = 0; j < self.maxVlines; j++) {
                self.dfsGrid[i][j] = -1;
            }
        }
        var components = 0;
        for (var i = 0; i < self.maxHlines; i++) {
            for (var j = 0; j < self.maxVlines; j++) {
                if (self.dfsGrid[i][j] === -1) {
                    self.dfs(i, j, components);
                    components++;
                }
            }
        }
        return components === 1;
    }

    self.ensureConnectivity = function () {
        if (self.checkConnectivity()) return;
        self.connectedList = [];
        self.connectedList.push(-1);
        self.connectedList.push(0);
        self.ddfs(0, 0);
    }

    self.createGrid();
    return this;
}

var game = new Game(games.length + 1)
games.push(game);

http.listen(port, function () {
    console.log(`listening on *:${port}`);
});