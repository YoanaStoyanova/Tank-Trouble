var Main = /** @class */ (function () {
    function Main() {
        this.game = null;
        this.socket = null;
        var address = "https://" + document.location.hostname + ":6969";
        this.socket = io(address);
        this.game = new Game(this.socket);
    }
    return Main;
}());
//# sourceMappingURL=main.js.map