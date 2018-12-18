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
        var isKeyDown = false;
        var moveInterval=null;
        document.addEventListener("keydown",function (event) {
            if(event.which == 38 ||event.which == 37 || event.which == 39 || event.which == 40){
                isKeyDown = true;
                moveInterval = setInterval(function(){
                    gameVM.notifyMovement();
                },50);
            }
            if (event.which == 32) { // space bar
                console.log("space bar");
                gameVM.notifyFire();
            }
        });
        document.addEventListener("keyup",function (event) {
            if(event.which == 38 ||event.which == 37 || event.which == 39 || event.which == 40){
                isKeyDown = false;
                clearInterval(moveInterval);
            }
            if (event.which == 32) { // space bar
                console.log("space bar");
                gameVM.notifyFire();
            }
        });
    }
};