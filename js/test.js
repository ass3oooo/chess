"use strict";

game.switchTurn.test = function() {
  game.board.getAllPieces().forEach(elem => {
    if (elem.position.enPassant) {
      console.log("this piece has position.enPassant = true", elem);
    }
    if (elem.position.castling) {
      console.log("this piece has position.castling = true", elem);
    }
    if (elem.position.force) {
      console.log("this piece has position.force = true", elem);
    }
  });
};

// game.board.map[6][4].piece.moveTo({x: 4, y: 3, force: true});
// game.board.map[1][3].piece.moveTo({x: 3, y: 3, force: true});
// game.board.map[0][4].piece.moveTo({x: 4, y: 6, force: true});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
