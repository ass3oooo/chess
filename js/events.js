"use strict";

(function() {
  let canvas = document.querySelector("#canvas");

  const KEYCODES = {
    104: "up",
    100: "left",
    102: "right",
    98: "down",
    105: "upRight",
    103: "upLeft",
    99: "downRight",
    97: "downLeft",
    101: "accept",
    107: "cancel"
  };

  canvas.addEventListener("click", function(evt) {

    let clickPosition = {
      x: Math.floor(evt.layerX / game.board._cellwidth),
      y: Math.floor(evt.layerY / game.board._cellwidth),
    }

    window.game.clickHandler(clickPosition);

  });

  document.addEventListener("keyup", function(evt) {
    if (KEYCODES[evt.keyCode]) {
      window.game.keyboardHandler(KEYCODES[evt.keyCode]);
    }
  });
})();
