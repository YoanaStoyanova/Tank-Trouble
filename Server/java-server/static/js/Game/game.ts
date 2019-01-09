var grid;
var game;
declare var Phaser: any;
var control1 = {
    up: Phaser.Keyboard.UP,
    down: Phaser.Keyboard.DOWN,
    left: Phaser.Keyboard.LEFT,
    right: Phaser.Keyboard.RIGHT,
    fire: Phaser.Keyboard.SPACEBAR,
};

class Game {
    private player = ko.observable(null);
    public playerName = ko.observable("");
    public opponentName = ko.observable("");
    private opponent = ko.observable(null);
    public playerReady = ko.observable(false);
    private id: number = null;
    public keyboard;
    public tankSpeed = 100;
    public rotationSpeed = 2;
    public bulletDelay = 10;
    public bulletSpeed = 200;
    public bulletTTL = 20000;
    public maxBullets = 5;
    public bullets;
    public gameReady = ko.observable(false);
    public isGameOver = ko.observable(false);
    public isStartScreen = ko.observable(true);
    public restartScreen = ko.observable(false);

    public grid = ko.observable(null);
    public gridInfo = ko.observable(null);
    constructor(private socket) {
        this.registerForSocketEvents();
        this.playerName(sessionStorage["name"]);
        this.socket.emit("playerName", this.playerName());
    }

    private registerForSocketEvents() {
        this.socket.on('connect', () => {
            this.socket.on("playerMove", this.opponentMove);
            this.socket.on("fireBullet", fireCoords => this.opponentFire(fireCoords));
            this.socket.on("gridReady", generatedGrid => this.gridInfo(generatedGrid));
            this.socket.on("playerId", id => this.id = id);
            this.socket.on("playerName", name => this.opponentName(name));
            this.socket.on("playersReady", (opponentName) => {
                this.opponentName(opponentName);
                this.isStartScreen(false);
                this.gameReady(true);
            });
        });
    }
    private opponentMove = (data) => {
        this.opponent().x = data.coords.x;
        this.opponent().y = data.coords.y;
        this.opponent().angle = data.angle
    }

    private getPlayerFireCoords = (player) => {
        let data = {
            x : player.x,
            y : player.y,
            angle : player.angle,
            isPlayerOne : player.isPlayerOne
        };
        console.log(data);
        return data;
    }

    public notifyMovement = () => {
        let data = {
            player: this.id,
            coords: {
                x: this.player().x,
                y: this.player().y
            },
            angle: this.player().angle
        }
        this.socket.emit("playerMove", data);
    }

    public notifyFire = () => {
        let coords = this.getPlayerFireCoords(this.player());
        this.socket.emit("fireBullet", coords);
    }

    private opponentFire = (fireCoords) => {
        this.createBullet(fireCoords);
    }

    private drawGrid() {
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
        this.grid(generatedGridInfo)
    }

    private captureKeys(controls) {
        this.keyboard.addKeyCapture(controls.up);
        this.keyboard.addKeyCapture(controls.down);
        this.keyboard.addKeyCapture(controls.left);
        this.keyboard.addKeyCapture(controls.right);
        this.keyboard.addKeyCapture(controls.fire);
    }

    private createTank(player, x, y, sprite, isPlayerOne) {
        player = game.add.sprite(x, y, sprite);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.anchor.set(0.5, 0.5);
        player.isPlayerOne = isPlayerOne;
        if (!isPlayerOne) player.angle = 180;
        return player;
    }

    private createBullet(player) {
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
    }

    private bulletCollided(bullet, gridLine) {
        var angle = Phaser.Math.radToDeg(bullet.body.angle);
        if (bullet.body.touching.up) {
            angle = -angle
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
    }

    private killBullets(bullet) {
        if (!bullet) return;

        var currTime = new Date().getTime();
        if (currTime > bullet.ttl) {
            bullet.isPlayerOne ? this.player().bullets-- : this.opponent().bullets--;
            bullet.destroy();
        }
    }

    private stopPlayer(player) {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;
    }

    private gameOver(player, bullet) {
        this.stopPlayer(this.player());
        this.stopPlayer(this.opponent());
        this.bullets.exists = false;
        this.isGameOver(true);

        if (this.id == 1) {
            if (player.key == 'player') {
                this.opponent().score(this.opponent().score() + 1);
            }
            else if (player.key == 'opponent') {
                this.player().score(this.player().score() + 1);
            }
        }
        if (this.id == 2) {
            if (player.key == 'player') {
                this.player().score(this.player().score() + 1);
            }
            else if (player.key == 'opponent') {
                this.opponent().score(this.opponent().score() + 1);
            }
        }
        this.restartScreen(true);
    }

    public startGame() {
        this.playerReady(true);        
        game = new Phaser.Game(this.gridInfo().arenaWidth + 2, this.gridInfo().arenaHeight + 2, Phaser.CANVAS, "arena", {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this),
        }, false, true);
        this.socket.emit('playerReady',sessionStorage["userId"]);
    }

    private preload() {
    game.load.image('hLine', 'static/assets/hLine.jpg');
    game.load.image('vLine', 'static/assets/vLine.jpg');
    game.load.image('player', 'static/assets/redTank.jpg');
    game.load.image('opponent', 'static/assets/blueTank.jpg');
    game.load.image('bullet', 'static/assets/bullet.png');
    }

    private createPlayer(old, coodsX, coordsY, id, Immidiate, controls): any {
        let player = this.createTank(old, coodsX, coordsY, id, Immidiate);
        player.bullets = 0;
        player.score = ko.observable(0);
        player.controls = controls;
        return player;
    }

    private create() {
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
        } else {
            this.player(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, control1));
            this.opponent(this.createPlayer(this.player(), 20, 20, "player", true, null));
        }

        this.keyboard = game.input.keyboard;
        this.captureKeys(control1);
        this.isGameOver(false);
    }

    public restart() {
        var score1 = this.player().score();
        var score2 = this.opponent().score();
        this.player().destroy();
        this.opponent().destroy();
        grid.destroy(true, true);
        this.bullets.destroy(true, true);

        this.drawGrid();
        if (this.id == 1) {
            this.player(this.createPlayer(this.player(), 20, 20, "player", true, control1));
            this.opponent(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, null));
        } else {
            this.player(this.createPlayer(this.opponent(), 780, 480, 'opponent', false, control1));
            this.opponent(this.createPlayer(this.player(), 20, 20, "player", true, null));
        }
        this.player().controls = control1;
        this.player().bullets = 0;
        this.opponent().bullets = 0;
        this.player().score(score1);
        this.opponent().score(score2);
        this.bullets.exists = true;
        this.isGameOver(false);
        this.restartScreen(false);
    }

    private updatePlayerCollisions(player) {
        game.physics.arcade.collide(player, grid);
        game.physics.arcade.collide(player, this.bullets, this.gameOver.bind(this));
    }

    private manualControlPosition(player, controls, playerBullets) {
        if (this.keyboard.isDown(controls.up)) {
            player.body.velocity = game.physics.arcade.velocityFromAngle(player.body.rotation, this.tankSpeed);
        } else if (this.keyboard.isDown(controls.down)) {
            player.body.velocity = game.physics.arcade.velocityFromAngle(player.body.rotation, -1 * this.tankSpeed);
        }

        if (this.keyboard.isDown(controls.left)) {
            player.angle -= this.rotationSpeed;
        } else if (this.keyboard.isDown(controls.right)) {
            player.angle += this.rotationSpeed;
        }

        if (this.keyboard.isDown(controls.fire) && this.keyboard.justPressed(controls.fire, this.bulletDelay) && playerBullets < this.maxBullets) {
            this.createBullet(player);
            this.notifyFire();
        }
    }

    private updatePlayerPosition(player) {
        this.stopPlayer(player);

        if (!this.isGameOver()) {
            this.manualControlPosition(player, player.controls, player.bullets);
        }
    }

    private update() {
        if (this.isGameOver()) {
            return;
        }

        this.bullets.forEach(this.killBullets.bind(this));
        game.physics.arcade.collide(this.bullets, grid, this.bulletCollided.bind(this));
        this.updatePlayerCollisions(this.player());
        this.updatePlayerCollisions(this.opponent());
        this.updatePlayerPosition(this.player());
    }
}
