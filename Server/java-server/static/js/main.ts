declare var Phaser: any;
declare var io;
class Main {
    public game: Game = null;
    private socket = null;
    constructor() {
        this.socket = io();
        // this.socket.emit("playerMove",{asd:"asd"});
        this.game = new Game(this.socket);
    }
}