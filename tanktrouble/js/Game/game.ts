var grid;
var game;
// var player1, player2;
declare var Phaser: any;
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
class Game {
    private player1 = ko.observable(null);
    private player2 = ko.observable(null);
    public maxHlines = 5;
    public maxVlines = 8;
    public arenaHeight = 500;
    public arenaWidth = 800;
    public wallDensity = 0.55;
    public keyboard;
    public tankSpeed = 100;
    public rotationSpeed = 2;
    public bulletDelay = 10;
    public bulletSpeed = 200;
    public bulletTTL = 20000;
    public maxBullets = 5;
    public bullets;
    public isGameOver = ko.observable(false);
    public isStartScreen = ko.observable(true);
    public restartScreen = ko.observable(false);
    public dfsGrid;
    public horGrid;
    public verGrid;
    public hLines;
    public vLines;
    public connectedList;

    public grid = ko.observable(null);
    public gridInfo = ko.observable(null);

    constructor(private socket) {
        socket.on('connect', () => {
            this.socket.on("playerMove",this.opponentMove);
            this.socket.on("fireBullet",this.opponentFire);
            this.socket.on("gridReady",(generatedGrid)=>{
                this.gridInfo(generatedGrid);
            });
        });
    }

    private opponentMove = (data)=>{
        console.log(data);
        console.log("opponent moved");
        
        let player = this.player1().key === data.player ? this.player1 : this.player2;

        player().body.velocity = new Phaser.Point(data.coords.x,data.coords.y);
        player().angle = data.angle;

    }

    private opponentFire = (data)=>{
        console.log(data);
        console.log("opponent fired");
    }

    private getRandomBool() {
        return Math.random() >= this.wallDensity;
    }

    private vBound(i) {
        return i <= 0 || i >= this.maxHlines;
    }

    private hBound(j) {
        return j <= 0 || j >= this.maxVlines;
    }

    private generateRandomGrid() {
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
                if (this.vBound(i)) this.horGrid[i][j] = true;
                if (this.hBound(j)) this.verGrid[i][j] = true;
            }
        }
    }

    private drawGrid() {
        // var widthPerRect = this.arenaWidth / this.maxVlines;
        // var heightPerRect = this.arenaHeight / this.maxHlines;
        var generatedGridInfo = this.gridInfo();
        for (var i = 0; i < generatedGridInfo.maxHlines + 1; i++) {
            for (var j = 0; j < generatedGridInfo.maxVlines + 1; j++) {
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

    private createBullet(x, y, angle, isPlayerOne) {
        var newBullet = this.bullets.create(x, y, 'bullet');
        newBullet.body.collideWorldBounds = true;
        newBullet.anchor.set(0.5, 0.5);
        newBullet.body.velocity = game.physics.arcade.velocityFromAngle(angle, this.bulletSpeed);
        newBullet.angle = angle;
        newBullet.ttl = new Date().getTime() + this.bulletTTL;
        newBullet.isPlayerOne = isPlayerOne;
        isPlayerOne ? this.player1().bullets++ : this.player2().bullets++;
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
            bullet.isPlayerOne ? this.player1().bullets-- : this.player2().bullets--;
            bullet.destroy();
        }
    }

    private displayScore(isPlayerOne) {
        this.restartScreen(true);
        document.getElementById('winner').innerHTML = isPlayerOne ? 'II' : 'I';
    }

    private stopPlayer(player) {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.body.angularVelocity = 0;
    }

    private gameOver(player, bullet) {
        this.stopPlayer(this.player1());
        this.stopPlayer(this.player2());
        this.bullets.exists = false;
        this.isGameOver(true);
        player.isPlayerOne ? this.player2().score(this.player2().score() + 1) : this.player1().score(this.player1().score() + 1);
        this.displayScore(player.isPlayerOne);
    }

    public startGame() {
        this.isStartScreen(false);
        game = new Phaser.Game(this.arenaWidth + 2, this.arenaHeight + 2, Phaser.CANVAS, "arena", {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this),
        }, false, true);
    }

    private preload() {
        game.load.image('hLine', 'assets/hLine.jpg');
        game.load.image('vLine', 'assets/vLine.jpg');
        game.load.image('tank1', 'assets/redTank.jpg');
        game.load.image('tank2', 'assets/blueTank.jpg');
        game.load.image('bullet', 'assets/bullet.png');
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

        // this.generateRandomGrid();
        // this.ensureConnectivity();

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
    }

    public restart() {
        var score1 = this.player1().score;
        var score2 = this.player2().score;
        this.player1().destroy();
        this.player2().destroy();
        grid.destroy(true, true);
        this.bullets.destroy(true, true);

        // this.generateRandomGrid();
        // this.ensureConnectivity();
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
    }

    private updatePlayerCollisions(player) {
        game.physics.arcade.collide(player, grid);
        game.physics.arcade.collide(player, this.bullets, this.gameOver.bind(this));
    }

    public notifyMovement = () => {
        let data = {
            player: this.player1().key,
            coords: {
                x: this.player1().body.velocity.x,
                y: this.player1().body.velocity.y
            },
            angle: this.player1().angle
        }
        this.socket.emit("playerMove", data);
        console.log("playerMove");
    }

    public notifyFire = () => {
        this.socket.emit("fireBullet","fiiiireeeee!");
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
            this.createBullet(player.position.x, player.position.y, player.body.rotation, player.isPlayerOne);
        }
    }

    private updatePlayerPosition(player) {
        this.stopPlayer(player);

        if (!this.isGameOver()) {
            this.manualControlPosition(player, player.controls, player.bullets);
            // TODO: AIControlPosition(player, player.bullets, player.isPlayerOne)
        }
    }

    private update() {
        if (this.isGameOver()) {
            return;
        }

        this.bullets.forEach(this.killBullets.bind(this));
        game.physics.arcade.collide(this.bullets, grid, this.bulletCollided.bind(this));
        this.updatePlayerCollisions(this.player1());
        this.updatePlayerCollisions(this.player2());
        this.updatePlayerPosition(this.player1());
        this.updatePlayerPosition(this.player2());
    }
}