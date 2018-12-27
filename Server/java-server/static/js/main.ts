declare var Phaser: any;
declare var io;
class Main {
    public game: Game = null;
    private socket = null;
    constructor() {
        this.socket = io("http://localhost:6969");
        this.game = new Game(this.socket);
    }
}
