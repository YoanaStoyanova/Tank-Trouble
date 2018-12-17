function throttled(fn, delay) {
    var lastCall = 0;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn.apply(void 0, args);
    };
}
ko.bindingHandlers.fightArena = {
    init: function (element, valueAccessor) {
        var gameVM = valueAccessor();
        document.getElementById('restart').addEventListener('click', gameVM.restart.bind(gameVM));
        document.getElementById('start').addEventListener('click', gameVM.startGame.bind(gameVM));
        document.body.addEventListener('keypress', function (e) {
            if (e.which === 13) {
                if (gameVM.isGameOver()) {
                    gameVM.restart();
                }
                else if (gameVM.isStartScreen()) {
                    gameVM.startGame();
                }
            }
        });
        document.addEventListener("keydown", function (event) {
            if (event.which == 38) {
                console.log("up");
                gameVM.notifyMovement();
            }
            if (event.which == 37) {
                console.log("up");
                gameVM.notifyMovement();
            }
            if (event.which == 39) {
                console.log("up");
                gameVM.notifyMovement();
            }
            if (event.which == 40) {
                console.log("up");
                gameVM.notifyMovement();
            }
            if (event.which == 32) {
                console.log("space bar");
                gameVM.notifyFire();
            }
        });
    }
};
//# sourceMappingURL=FightArenaBinding.js.map