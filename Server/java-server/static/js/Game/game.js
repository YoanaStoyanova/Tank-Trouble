var grid;
var game;
var control1 = {
    up: Phaser.Keyboard.UP,
    down: Phaser.Keyboard.DOWN,
    left: Phaser.Keyboard.LEFT,
    right: Phaser.Keyboard.RIGHT,
    fire: Phaser.Keyboard.SPACEBAR,
};
var Game = /** @class */ (function () {
    function Game(socket) {
        var _this = this;
        this.socket = socket;
        this.player = ko.observable(null);
        this.playerName = ko.observable("");
        this.opponentName = ko.observable("");
        this.opponent = ko.observable(null);
        this.playerReady = ko.observable(false);
        this.id = null;
        this.tankSpeed = 100;
        this.rotationSpeed = 2;
        this.bulletDelay = 10;
        this.bulletSpeed = 200;
        this.bulletTTL = 20000;
        this.maxBullets = 5;
        this.gameReady = ko.observable(false);
        this.isGameOver = ko.observable(false);
        this.isStartScreen = ko.observable(true);
        this.restartScreen = ko.observable(false);
        this.grid = ko.observable(null);
        this.gridInfo = ko.observable(null);
        this.opponentMove = function (data) {
            _this.opponent().x = data.coords.x;
            _this.opponent().y = data.coords.y;
            _this.opponent().angle = data.angle;
        };
        this.getPlayerFireCoords = function (player) {
            var data = {
                x: player.x,
                y: player.y,
                angle: player.angle,
                isPlayerOne: player.isPlayerOne
            };
            console.log(data);
            return data;
        };
        this.notifyMovement = function () {
            var data = {
                player: _this.id,
                coords: {
                    x: _this.player().x,
                    y: _this.player().y
                },
                angle: _this.player().angle
            };
            _this.socket.emit("playerMove", data);
        };
        this.notifyFire = function () {
            var coords = _this.getPlayerFireCoords(_this.player());
            _this.socket.emit("fireBullet", coords);
        };
        this.opponentFire = function (fireCoords) {
            _this.createBullet(fireCoords);
        };
        this.registerForSocketEvents();
        this.playerName(sessionStorage["name"]);
        this.socket.emit("playerName", this.playerName());
    }
    Game.prototype.registerForSocketEvents = function () {
        var _this = this;
        this.socket.on('connect', function () {
            _this.socket.on("playerMove", _this.opponentMove);
            _this.socket.on("fireBullet", function (fireCoords) { return _this.opponentFire(fireCoords); });
            _this.socket.on("gridReady", function (generatedGrid) { return _this.gridInfo(generatedGrid); });
            _this.socket.on("playerId", function (id) { return _this.id = id; });
            _this.socket.on("playerName", function (name) { return _this.opponentName(name); });
            _this.socket.on("playersReady", function (opponentName) {
                _this.opponentName(opponentName);
                _this.isStartScreen(false);
                _this.gameReady(true);
            });
        });
    };
    Game.prototype.drawGrid = function () {
        var generatedGridInfo = this.gridInfo();
        for (var i = 0; i < generatedGridInfo.maxHlines; i++) {
            for (var j = 0; j < generatedGridInfo.maxVlines; j++) {
                if (generatedGridInfo.horGrid[i][j] == true) {
                    generatedGridInfo.hLines[i][j] = grid.create(generatedGridInfo.widthPerRect * j, (generatedGridInfo.heightPerRect * i), 'hLine');
                    generatedGridInfo.hLines[i][j].body.immovable = true;
                }
                if (generatedGridInfo.verGrid[i][j] == true) {
                    generatedGridInfo.vLines[i][j] = grid.create((generatedGridInfo.widthPerRect * j), generatedGridInfo.heightPerRect * i, 'vLine');
                    generatedGridInfo.vLines[i][j].body.immovable = true;
                }
            }
        }
        this.grid(generatedGridInfo);
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
    Game.prototype.createBullet = function (player) {
        var x = player.x;
        var y = player.y;
        var angle = player.angle;
        var newBullet = this.bullets.create(x, y, 'bullet');
        newBullet.body.collideWorldBounds = true;
        newBullet.anchor.set(0.5, 0.5);
        newBullet.body.velocity = game.physics.arcade.velocityFromAngle(angle, this.bulletSpeed);
        newBullet.angle = angle;
        newBullet.ttl = new Date().getTime() + this.bulletTTL;
        newBullet.isPlayerOne = player.isPlayerOne;
        player.bullets++;
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
            bullet.isPlayerOne ? this.player().bullets-- : this.opponent().bullets--;
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
        this.stopPlayer(this.player());
        this.stopPlayer(this.opponent());
        this.bullets.exists = false;
        this.isGameOver(true);
        player.isPlayerOne ? this.opponent().score(this.opponent().score() + 1) : this.player().score(this.player().score() + 1);
        this.displayScore(player.isPlayerOne);
    };
    Game.prototype.startGame = function () {
        this.playerReady(true);
        game = new Phaser.Game(this.gridInfo().arenaWidth + 2, this.gridInfo().arenaHeight + 2, Phaser.CANVAS, "arena", {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this),
        }, false, true);
        this.socket.emit('playerReady', sessionStorage["userId"]);
    };
    Game.prototype.preload = function () {
        game.load.image('hLine', 'static/assets/hLine.jpg');
        game.load.image('vLine', 'static/assets/vLine.jpg');
        game.load.image('player', 'static/assets/redTank.jpg');
        game.load.image('opponent', 'static/assets/blueTank.jpg');
        game.load.image('bullet', 'static/assets/bullet.png');
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
        grid = game.add.group();
        grid.enableBody = true;
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.drawGrid();
        if (this.id == 1) {
            this.player(this.createPlayer(this.player(), 20, 20, "player", true, control1));
            this.opponent(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, null));
        }
        else {
            this.player(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, control1));
            this.opponent(this.createPlayer(this.player(), 20, 20, "player", true, null));
        }
        this.keyboard = game.input.keyboard;
        this.captureKeys(control1);
        this.isGameOver(false);
    };
    Game.prototype.restart = function () {
        var score1 = this.player().score;
        var score2 = this.opponent().score;
        this.player().destroy();
        this.opponent().destroy();
        grid.destroy(true, true);
        this.bullets.destroy(true, true);
        this.drawGrid();
        if (this.id == 1) {
            this.player(this.createPlayer(this.player(), 20, 20, "player", true, control1));
            this.opponent(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, null));
        }
        else {
            this.player(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, control1));
            this.opponent(this.createPlayer(this.player(), 20, 20, "player", true, null));
        }
        this.player().controls = control1;
        this.player().bullets = 0;
        this.opponent().bullets = 0;
        this.player().score = score1;
        this.opponent().score = score2;
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
            this.createBullet(player);
            this.notifyFire();
        }
    };
    Game.prototype.updatePlayerPosition = function (player) {
        this.stopPlayer(player);
        if (!this.isGameOver()) {
            this.manualControlPosition(player, player.controls, player.bullets);
        }
    };
    Game.prototype.update = function () {
        if (this.isGameOver()) {
            return;
        }
        this.bullets.forEach(this.killBullets.bind(this));
        game.physics.arcade.collide(this.bullets, grid, this.bulletCollided.bind(this));
        this.updatePlayerCollisions(this.player());
        this.updatePlayerCollisions(this.opponent());
        this.updatePlayerPosition(this.player());
    };
    return Game;
}());
//# sourceMappingURL=game.js.map