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
        var isKeyDown = false;
        //up, down, left, right
        var keys = [false, false, false, false];
        var moveInterval = null;
        document.addEventListener("keydown", function (event) {
            if (event.which == 32) { // space bar
                console.log("fire made");
                gameVM.notifyFire();
            }
        });
        document.addEventListener("keydown", function (event) {
            if (event.which == 38) { //up
                keys[0] = true;
            }
            if (event.which == 37) { //left
                keys[2] = true;
            }
            if (event.which == 39) { //right
                keys[3] = true;
            }
            if (event.which == 40) { //down
                keys[1] = true;
            }
            var isSomeKeyPressed = keys.some(function (val) { return val === true; });
            if (isSomeKeyPressed && moveInterval === null) {
                moveInterval = setInterval(function () {
                    gameVM.notifyMovement();
                }, 50);
            }
        });
        document.addEventListener("keyup", function (event) {
            if (event.which == 38) { //up
                keys[0] = false;
            }
            if (event.which == 37) { //left
                keys[2] = false;
            }
            if (event.which == 39) { //right
                keys[3] = false;
            }
            if (event.which == 40) { //down
                keys[1] = false;
            }
            var isSomeKeyPressed = keys.some(function (val) { return val === true; });
            if (!isSomeKeyPressed) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        });
        var subsc = gameVM.isStartScreen.subscribe(function () {
            element.focus();
        });
        var subscEndScreen = gameVM.isGameOver.subscribe(function () {
            element.focus();
        });
        document.addEventListener('focus', function () {
            element.focus();
        });
        document.addEventListener('blur', function () {
            element.focus();
        });
    }
};
//# sourceMappingURL=FightArenaBinding.js.map