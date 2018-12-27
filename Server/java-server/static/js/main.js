var Main = /** @class */ (function () {
    function Main() {
        this.game = null;
        this.socket = null;
        this.socket = io("http://localhost:6969");
        this.game = new Game(this.socket);
    }
    return Main;
}());
//# sourceMappingURL=main.js.map