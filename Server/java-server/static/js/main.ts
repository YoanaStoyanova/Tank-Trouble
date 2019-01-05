declare var Phaser: any;
declare var io;
class Main {
    public game: Game = null;
    private socket = null;
    constructor() {
        var address = "https://" + document.location.hostname + ":6969";
        this.socket = io(address);
        this.game = new Game(this.socket);
    }
}
