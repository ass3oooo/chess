"use strict";

(function() {
  let canvas = document.querySelector("#canvas");

  canvas.addEventListener("click", function(evt) {

    let clickPosition = {
      x: Math.floor(evt.layerX / game.board._cellwidth),
      y: Math.floor(evt.layerY / game.board._cellwidth),
    }

    window.game.clickHandler(clickPosition);

  });
})();
