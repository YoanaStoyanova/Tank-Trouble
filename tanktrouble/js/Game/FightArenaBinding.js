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
        document.addEventListener("keydown", debounce(function (event) {
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
        }, 200));
    }
};
//# sourceMappingURL=FightArenaBinding.js.map