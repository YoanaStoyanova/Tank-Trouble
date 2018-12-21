declare var ko;
function throttled(fn, delay, ) {
    let lastCall = 0;
    return function (...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}
ko.bindingHandlers.fightArena = {
    init: function (element: HTMLElement, valueAccessor: any) {
        let gameVM: Game = valueAccessor();
        document.getElementById('restart').addEventListener('click', gameVM.restart.bind(gameVM));
        document.getElementById('start').addEventListener('click', gameVM.startGame.bind(gameVM));
        document.body.addEventListener('keypress', function (e) {
            if (e.which === 13) {
                if (gameVM.isGameOver()) {
                    gameVM.restart();
                } else if (gameVM.isStartScreen()) {
                    gameVM.startGame();
                }
            }
        });
        var isKeyDown = false;
        //up, down, left, right
        var keys = [false, false, false, false]
        var moveInterval = null;
        document.addEventListener("keydown", function (event) {
            if (event.which == 32) { // space bar
                gameVM.notifyFire();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.which == 38) {//up
                keys[0] = true;
            }

            if (event.which == 37) {//left
                keys[2] = true;
            }

            if (event.which == 39) {//right
                keys[3] = true;
            }

            if (event.which == 40) {//down
                keys[1] = true;
            }
            var isSomeKeyPressed = keys.some(val => val === true);
            if (isSomeKeyPressed && moveInterval === null) {
                console.log("set");
                moveInterval = setInterval(function () {
                    gameVM.notifyMovement();
                }, 50);
            }
        });

        document.addEventListener("keyup", function (event) {
            if (event.which == 38) {//up
                keys[0] = false;
            }

            if (event.which == 37) {//left
                keys[2] = false;
            }

            if (event.which == 39) {//right
                keys[3] = false;
            }

            if (event.which == 40) {//down
                keys[1] = false;
            }

            var isSomeKeyPressed = keys.some(val => val === true);
            if (!isSomeKeyPressed) {
                clearInterval(moveInterval);
                moveInterval = null;
            }
        });
    }
};