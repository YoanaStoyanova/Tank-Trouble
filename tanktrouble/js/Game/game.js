var grid;
var game;
var control1 = {
    up: Phaser.Keyboard.UP,
    down: Phaser.Keyboard.DOWN,
    left: Phaser.Keyboard.LEFT,
    right: Phaser.Keyboard.RIGHT,
    fire: Phaser.Keyboard.M,
};
var control2 = {
    up: Phaser.Keyboard.E,
    down: Phaser.Keyboard.D,
    left: Phaser.Keyboard.S,
    right: Phaser.Keyboard.F,
    fire: Phaser.Keyboard.Q,
};
var Game = /** @class */ (function () {
    function Game(socket) {
        var _this = this;
        this.socket = socket;
        this.player1 = ko.observable(null);
        this.player2 = ko.observable(null);
        this.maxHlines = 5;
        this.maxVlines = 8;
        this.arenaHeight = 500;
        this.arenaWidth = 800;
        this.wallDensity = 0.55;
        this.tankSpeed = 100;
        this.rotationSpeed = 2;
        this.bulletDelay = 10;
        this.bulletSpeed = 200;
        this.bulletTTL = 20000;
        this.maxBullets = 5;
        this.isGameOver = ko.observable(false);
        this.isStartScreen = ko.observable(true);
        this.restartScreen = ko.observable(false);
        this.opponentMove = function (data) {
            console.log(data);
            console.log("opponent moved");
            var player = _this.player1().key === data.player ? _this.player1 : _this.player2;
            player().body.velocity = new Phaser.Point(data.coords.x, data.coords.y);
            player().angle = data.angle;
        };
        this.opponentFire = function (data) {
            console.log(data);
            console.log("opponent fired");
        };
        this.notifyMovement = function () {
            var data = {
                player: _this.player1().key,
                coords: {
                    x: _this.player1().body.velocity.x,
                    y: _this.player1().body.velocity.y
                },
                angle: _this.player1().angle
            };
            _this.socket.emit("playerMove", data);
            console.log("playerMove");
        };
        this.notifyFire = function () {
            _this.socket.emit("fireBullet", "fiiiireeeee!");
        };
        socket.on('connect', function () {
            _this.socket.on("playerMove", _this.opponentMove);
            _this.socket.on("fireBullet", _this.opponentFire);
        });
    }
    Game.prototype.getRandomBool = function () {
        return Math.random() >= this.wallDensity;
    };
    Game.prototype.vBound = function (i) {
        return i <= 0 || i >= this.maxHlines;
    };
    Game.prototype.hBound = function (j) {
        return j <= 0 || j >= this.maxVlines;
    };
    Game.prototype.generateRandomGrid = function () {
        this.horGrid = new Array(this.maxHlines + 1);
        this.verGrid = new Array(this.maxHlines + 1);
        this.hLines = new Array(this.maxHlines + 1);
        this.vLines = new Array(this.maxHlines + 1);
        for (var i = 0; i < this.maxHlines + 1; i++) {
            this.horGrid[i] = new Array(this.maxVlines + 1);
            this.hLines[i] = new Array(this.maxVlines + 1);
            this.verGrid[i] = new Array(this.maxVlines + 1);
            this.vLines[i] = new Array(this.maxVlines + 1);
        }
        for (var i = 0; i < this.maxHlines + 1; i++) {
            for (var j = 0; j < this.maxVlines + 1; j++) {
                this.horGrid[i][j] = this.getRandomBool();
                this.verGrid[i][j] = this.getRandomBool();
                if (this.vBound(i))
                    this.horGrid[i][j] = true;
                if (this.hBound(j))
                    this.verGrid[i][j] = true;
            }
        }
    };
    Game.prototype.dfs = function (i, j, k) {
        if (this.dfsGrid[i][j] !== -1)
            return;
        this.dfsGrid[i][j] = k;
        if (!this.vBound(i + 1) && !this.horGrid[i + 1][j]) {
            this.dfs(i + 1, j, k);
        }
        if (!this.vBound(i) && !this.horGrid[i][j]) {
            this.dfs(i - 1, j, k);
        }
        if (!this.hBound(j + 1) && !this.verGrid[i][j + 1]) {
            this.dfs(i, j + 1, k);
        }
        if (!this.hBound(j) && !this.verGrid[i][j]) {
            this.dfs(i, j - 1, k);
        }
    };
    Game.prototype.ddfs = function (i, j) {
        if (this.dfsGrid[i][j] === -1)
            return;
        this.dfsGrid[i][j] = -1;
        if (!this.vBound(i + 1)) {
            if (this.horGrid[i + 1][j] && this.connectedList.indexOf(this.dfsGrid[i + 1][j]) === -1) {
                this.horGrid[i + 1][j] = false;
                this.connectedList.push(this.dfsGrid[i + 1][j]);
            }
            this.ddfs(i + 1, j);
        }
        if (!this.vBound(i)) {
            if (this.horGrid[i][j] && this.connectedList.indexOf(this.dfsGrid[i - 1][j]) === -1) {
                this.horGrid[i][j] = false;
                this.connectedList.push(this.dfsGrid[i - 1][j]);
            }
            this.ddfs(i - 1, j);
        }
        if (!this.hBound(j + 1)) {
            if (this.verGrid[i][j + 1] && this.connectedList.indexOf(this.dfsGrid[i][j + 1]) === -1) {
                this.verGrid[i][j + 1] = false;
                this.connectedList.push(this.dfsGrid[i][j + 1]);
            }
            this.ddfs(i, j + 1);
        }
        if (!this.hBound(j)) {
            if (this.verGrid[i][j] && this.connectedList.indexOf(this.dfsGrid[i][j - 1]) === -1) {
                this.verGrid[i][j] = false;
                this.connectedList.push(this.dfsGrid[i][j - 1]);
            }
            this.ddfs(i, j - 1);
        }
    };
    Game.prototype.checkConnectivity = function () {
        this.dfsGrid = new Array(this.maxHlines);
        for (var i = 0; i < this.maxHlines; i++)
            this.dfsGrid[i] = new Array(this.maxVlines);
        for (var i = 0; i < this.maxHlines; i++) {
            for (var j = 0; j < this.maxVlines; j++) {
                this.dfsGrid[i][j] = -1;
            }
        }
        var components = 0;
        for (var i = 0; i < this.maxHlines; i++) {
            for (var j = 0; j < this.maxVlines; j++) {
                if (this.dfsGrid[i][j] === -1) {
                    this.dfs(i, j, components);
                    components++;
                }
            }
        }
        return components === 1;
    };
    Game.prototype.ensureConnectivity = function () {
        if (this.checkConnectivity())
            return;
        this.connectedList = [];
        this.connectedList.push(-1);
        this.connectedList.push(0);
        this.ddfs(0, 0);
    };
    Game.prototype.drawGrid = function () {
        var widthPerRect = this.arenaWidth / this.maxVlines;
        var heightPerRect = this.arenaHeight / this.maxHlines;
        for (var i = 0; i < this.maxHlines + 1; i++) {
            for (var j = 0; j < this.maxVlines + 1; j++) {
                if (this.horGrid[i][j] == true) {
                    this.hLines[i][j] = grid.create(widthPerRect * j, (heightPerRect * i), 'hLine');
                    this.hLines[i][j].body.immovable = true;
                }
                if (this.verGrid[i][j] == true) {
                    this.vLines[i][j] = grid.create((widthPerRect * j), heightPerRect * i, 'vLine');
                    this.vLines[i][j].body.immovable = true;
                }
            }
        }
    };
    Game.prototype.captureKeys = function (controls) {
        this.keyboard.addKeyCapture(controls.up);
        this.keyboard.addKeyCapture(controls.down);
        this.keyboard.addKeyCapture(controls.left);
        this.keyboard.addKeyCapture(controls.right);
        this.keyboard.addKeyCapture(controls.fire);
    };
    Game.prototype.createTank = function (player, x, y, sprite, isPlayerOne) {
        player = game.add.sprite(x, y, sprite);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.anchor.set(0.5, 0.5);
        player.isPlayerOne = isPlayerOne;
        if (!isPlayerOne)
            player.angle = 180;
        return player;
    };
    Game.prototype.createBullet = function (x, y, angle, isPlayerOne) {
        var newBullet = this.bullets.create(x, y, 'bullet');
        newBullet.body.collideWorldBounds = true;
        newBullet.anchor.set(0.5, 0.5);
        newBullet.body.velocity = game.physics.arcade.velocityFromAngle(angle, this.bulletSpeed);
        newBullet.angle = angle;
        newBullet.ttl = new Date().getTime() + this.bulletTTL;
        newBullet.isPlayerOne = isPlayerOne;
        isPlayerOne ? this.player1().bullets++ : this.player2().bullets++;
    };
    Game.prototype.bulletCollided = function (bullet, gridLine) {
        var angle = Phaser.Math.radToDeg(bullet.body.angle);
        if (bullet.body.touching.up) {
            angle = -angle;
        }
        if (bullet.body.touching.down) {
            angle = -angle;
        }
        if (bullet.body.touching.left) {
            angle = angle > 0 ? 180 - angle : -180 - angle;
        }
        if (bullet.body.touching.right) {
            angle = angle > 0 ? 180 - angle : -180 - angle;
        }
        bullet.body.velocity = game.physics.arcade.velocityFromAngle(angle, this.bulletSpeed);
    };
    Game.prototype.killBullets = function (bullet) {
        if (!bullet)
            return;
        var currTime = new Date().getTime();
        if (currTime > bullet.ttl) {
            bullet.isPlayerOne ? this.player1().bullets-- : this.player2().bullets--;
            bullet.destroy();
        }
    };
    Game.prototype.displayScore = function (isPlayerOne) {
        this.restartScreen(true);
        document.getElementById('winner').innerHTML = isPlayerOne ? 'II' : 'I';
    };
    Game.prototype.stopPlayer = function (player) {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;
    };
    Game.prototype.gameOver = function (player, bullet) {
        this.stopPlayer(this.player1());
        this.stopPlayer(this.player2());
        this.bullets.exists = false;
        this.isGameOver(true);
        player.isPlayerOne ? this.player2().score(this.player2().score() + 1) : this.player1().score(this.player1().score() + 1);
        this.displayScore(player.isPlayerOne);
    };
    Game.prototype.startGame = function () {
        this.isStartScreen(false);
        game = new Phaser.Game(this.arenaWidth + 2, this.arenaHeight + 2, Phaser.CANVAS, "arena", {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this),
        }, false, true);
    };
    Game.prototype.preload = function () {
        game.load.image('hLine', 'assets/hLine.jpg');
        game.load.image('vLine', 'assets/vLine.jpg');
        game.load.image('tank1', 'assets/redTank.jpg');
        game.load.image('tank2', 'assets/blueTank.jpg');
        game.load.image('bullet', 'assets/bullet.png');
    };
    Game.prototype.createPlayer = function (old, coodsX, coordsY, id, Immidiate, controls) {
        var player = this.createTank(old, coodsX, coordsY, id, Immidiate);
        player.bullets = 0;
        player.score = ko.observable(0);
        player.controls = controls;
        return player;
    };
    Game.prototype.create = function () {
        game.stage.backgroundColor = "#FFFFFF";
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.generateRandomGrid();
        this.ensureConnectivity();
        grid = game.add.group();
        grid.enableBody = true;
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.drawGrid();
        this.player1(this.createPlayer(this.player1(), 20, 20, "tank1", true, control1));
        this.player2(this.createPlayer(this.player2(), 780, 480, 'tank2', false, control2));
        this.keyboard = game.input.keyboard;
        this.captureKeys(control1);
        this.captureKeys(control2);
        this.isGameOver(false);
    };
    Game.prototype.restart = function () {
        var score1 = this.player1().score;
        var score2 = this.player2().score;
        this.player1().destroy();
        this.player2().destroy();
        grid.destroy(true, true);
        this.bullets.destroy(true, true);
        this.generateRandomGrid();
        this.ensureConnectivity();
        this.drawGrid();
        this.player1(this.createTank(this.player1(), 20, 20, 'tank1', true));
        this.player2(this.createTank(this.player2(), 780, 480, 'tank2', false));
        this.player1().controls = control1;
        this.player2().controls = control2;
        this.player1().bullets = 0;
        this.player2().bullets = 0;
        this.player1().score = score1;
        this.player2().score = score2;
        this.bullets.exists = true;
        this.isGameOver(false);
        this.restartScreen(false);
    };
    Game.prototype.updatePlayerCollisions = function (player) {
        game.physics.arcade.collide(player, grid);
        game.physics.arcade.collide(player, this.bullets, this.gameOver.bind(this));
    };
    Game.prototype.manualControlPosition = function (player, controls, playerBullets) {
        if (this.keyboard.isDown(controls.up)) {
            player.body.velocity = game.physics.arcade.velocityFromAngle(player.body.rotation, this.tankSpeed);
        }
        else if (this.keyboard.isDown(controls.down)) {
            player.body.velocity = game.physics.arcade.velocityFromAngle(player.body.rotation, -1 * this.tankSpeed);
        }
        if (this.keyboard.isDown(controls.left)) {
            player.angle -= this.rotationSpeed;
        }
        else if (this.keyboard.isDown(controls.right)) {
            player.angle += this.rotationSpeed;
        }
        if (this.keyboard.isDown(controls.fire) && this.keyboard.justPressed(controls.fire, this.bulletDelay) && playerBullets < this.maxBullets) {
            this.createBullet(player.position.x, player.position.y, player.body.rotation, player.isPlayerOne);
        }
    };
    Game.prototype.updatePlayerPosition = function (player) {
        this.stopPlayer(player);
        if (!this.isGameOver()) {
            this.manualControlPosition(player, player.controls, player.bullets);
            // TODO: AIControlPosition(player, player.bullets, player.isPlayerOne)
        }
    };
    Game.prototype.update = function () {
        if (this.isGameOver()) {
            return;
        }
        this.bullets.forEach(this.killBullets.bind(this));
        game.physics.arcade.collide(this.bullets, grid, this.bulletCollided.bind(this));
        this.updatePlayerCollisions(this.player1());
        this.updatePlayerCollisions(this.player2());
        this.updatePlayerPosition(this.player1());
        this.updatePlayerPosition(this.player2());
    };
    return Game;
}());
//# sourceMappingURL=game.js.map