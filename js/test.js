"use strict";

game.switchTurn.test = function() {
  game.board.pieces.forEach(elem => {
    if (elem.position.enPassant) {
      console.log("this piece has position.enPassant = true", elem);
    }
    if (elem.position.force) {
      console.log("this piece has position.force = true", elem);
    }
  });
};

game.board.map[6][4].piece.moveTo({x: 4, y: 3, force: true});
game.board.map[1][3].piece.moveTo({x: 3, y: 3, force: true});
