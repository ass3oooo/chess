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

  // toHorse.style.display = "none";
  // toRook.style.display = "none";
  // toElephant.style.display = "none";
  // toQueen.style.display = "none";

  function clickEvent(evt) {
    let clickPosition = {
      x: Math.floor(evt.layerX / game.board._cellwidth),
      y: Math.floor(evt.layerY / game.board._cellwidth),
    }

    if (!window.game.state.paused) {
      window.game.clickHandler(clickPosition);
    }

  }

  function rightClickEvent(evt) {
    evt.preventDefault();
    let clickPosition = {
      x: Math.floor(evt.layerX / game.board._cellwidth),
      y: Math.floor(evt.layerY / game.board._cellwidth),
    }

    if (!window.game.state.paused) {
      window.game.rightClickHandler(clickPosition);
    }
  }

  window.gameClickEvent = clickEvent;

  canvas.addEventListener("click", clickEvent);
  canvas.addEventListener("contextmenu", rightClickEvent);

  document.addEventListener("keydown", function(evt) {
    if (KEYCODES[evt.keyCode]) {
      window.game.keyboardHandler(KEYCODES[evt.keyCode]);
    }
  });
})();
