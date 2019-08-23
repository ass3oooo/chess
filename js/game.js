"use strict";

(function() {
  const BLACK = "b";
  const WHITE = "w";

  class Game {
    constructor() {
      this.board = new ChessBoard();

      generateOptions.call(this).forEach(option => {
        this.board.addPiece(option);
      });

      this.state = {};

      this.board.updateMap();
      this.board.render();
      this.board.renderPieces();

    }

    clickHandler(position) {
      let isClickOnPiece = this.board.map[position.y][position.x];
      let highlightedCell = false; //это так не работает. каждый раз создается новая переменная

      if (isClickOnPiece) { //клик по фигуре?
        if (this.chosed) { //есть ранее выбранная?
          if (!(isClickOnPiece.side === "b")) {
            let index = this.board.pieces.indexOf(isClickOnPiece);
            this.board.pieces.splice(index, 1);
            this.chosed.moveTo(position);
            this.chosed = false;
          } else {
            this.chosed = false;
            console.log(highlightedCell);
            // if (highlightedCell) {
            //   this.board.render();
            //   highlightedCell = false;
            //   this.board.renderPieces();
            // }
          }
        } else {
          if (isClickOnPiece.side === "b") {               //по моей фигуре?
            console.log("a");
            this.board.render();
            window.highlightCell.call(this.board, isClickOnPiece.position);
            highlightedCell = true;
            this.board.renderPieces();
            this.chosed = isClickOnPiece;                  //да - выбрать ее для следующего клика
            console.log(highlightedCell);
          } else {
            console.log("b");
            this.board.render();
            window.highlightCell.call(this.board, isClickOnPiece.position);
            highlightedCell = true;
            this.board.renderPieces();
          }
        }
      } else {
        if (this.chosed) {
          this.chosed.moveTo(position);
          this.chosed = false;
        }
        if (highlightedCell) {
          this.board.render();
          this.board.renderPieces();
          highlightedCell = false;
        }
      }

    }
  }

  function generateOptions() {

    let options = [];

    options.push(gen.call(this, BLACK, "pawn", 0, 1));
    options.push(gen.call(this, BLACK, "pawn", 1, 1));
    options.push(gen.call(this, BLACK, "pawn", 2, 1));
    options.push(gen.call(this, BLACK, "pawn", 3, 1));
    options.push(gen.call(this, BLACK, "pawn", 4, 1));
    options.push(gen.call(this, BLACK, "pawn", 5, 1));
    options.push(gen.call(this, BLACK, "pawn", 6, 1));
    options.push(gen.call(this, BLACK, "pawn", 7, 1));

    options.push(gen.call(this, WHITE, "pawn", 0, 6));
    options.push(gen.call(this, WHITE, "pawn", 1, 6));
    options.push(gen.call(this, WHITE, "pawn", 2, 6));
    options.push(gen.call(this, WHITE, "pawn", 3, 6));
    options.push(gen.call(this, WHITE, "pawn", 4, 6));
    options.push(gen.call(this, WHITE, "pawn", 5, 6));
    options.push(gen.call(this, WHITE, "pawn", 6, 6));
    options.push(gen.call(this, WHITE, "pawn", 7, 6));

    options.push(gen.call(this, BLACK, "horse", 1, 0));
    options.push(gen.call(this, BLACK, "horse", 6, 0));

    options.push(gen.call(this, WHITE, "horse", 1, 7));
    options.push(gen.call(this, WHITE, "horse", 6, 7));

    options.push(gen.call(this, BLACK, "elephant", 2, 0));
    options.push(gen.call(this, BLACK, "elephant", 5, 0));

    options.push(gen.call(this, WHITE, "elephant", 2, 7));
    options.push(gen.call(this, WHITE, "elephant", 5, 7));

    options.push(gen.call(this, BLACK, "rook", 0, 0));
    options.push(gen.call(this, BLACK, "rook", 7, 0));

    options.push(gen.call(this, WHITE, "rook", 0, 7));
    options.push(gen.call(this, WHITE, "rook", 7, 7));

    options.push(gen.call(this, BLACK, "queen", 3, 0));
    options.push(gen.call(this, WHITE, "queen", 3, 7));

    options.push(gen.call(this, BLACK, "king", 4, 0));
    options.push(gen.call(this, WHITE, "king", 4, 7));



    return options;

    function gen(...options) {
      return {
        side: options[0],
        type: options[1],
        position: {
          x: options[2],
          y: options[3]
        },
        board: this.board
      };
    }
  }

  window.game = new Game();

})();
