declare var ko;
function throttled(fn,delay,) {
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

        document.addEventListener("keydown",function (event) {
            if (event.which == 38) {// up
                console.log("up");
                gameVM.notifyMovement()
            }
            if (event.which == 37) { //left
                console.log("up");
                gameVM.notifyMovement()
            }
            if (event.which == 39) { //right
                console.log("up");
                gameVM.notifyMovement()
            }
            if (event.which == 40) { //down
                console.log("up");
                gameVM.notifyMovement()
            }
            if (event.which == 32) { // space bar
                console.log("space bar");
                gameVM.notifyFire();
            }
        });
    }
};