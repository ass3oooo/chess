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

      let answers = "";

      let functions = {
        "10": function() { //prev click on enemy piece or on empty cell or no prev click, this on our piece => choose this piece
          this.chosed = isClickOnPiece;

          this.board.render();
          window.highlightCell.call(this.board, this.chosed.position);
          isClickOnPiece.highlightTurns();
          this.board.renderPieces();
        },
        "8": function() { //prev click on empty piece or no prev click, this on our piece => choose this piece
          this.chosed = false;

          this.board.render();
          window.highlightCell.call(this.board, isClickOnPiece.position);
          isClickOnPiece.highlightTurns();
          this.board.renderPieces();
        },
        "12": function() { //prev click on our piece, this on enemy piece => make turn, remove enemy piece

          let index = this.board.pieces.indexOf(isClickOnPiece);
          this.board.pieces.splice(index, 1);

          this.chosed.moveTo(isClickOnPiece.position);
          this.chosed = false;
        },
        "4": function() { //prev click on our piece, this click on empty cell => make turn
          this.chosed.moveTo(position);
          this.chosed = false;
        },
        "1": function() { //prev click on empty cell or on enemy piece, this click on empry cell => rerender map
          this.board.render();
          this.board.renderPieces();
        },
        "14": function() { //prev click on our piece, this click on our piece => choose this piece, then highlight
          this.chosed = isClickOnPiece;

          this.board.render();
          window.highlightCell.call(this.board, this.chosed.position);
          isClickOnPiece.highlightTurns();
          this.board.renderPieces();
        },
        "15": function() { //prev click and this click on this our piece => unchoose this piece
          this.chosed = false;

          this.board.render();
          this.board.renderPieces();
        }
      }

      answers += (isClickOnPiece) ? "1" : "0";
      answers += (this.chosed) ? "1" : "0";
      answers += (isClickOnPiece.side === "b") ? "1" : "0";
      answers += (isClickOnPiece === this.chosed) ? "1" : "0";

      //after answer the questions, the "answers" variable becomes a string like binary number "1001",
      //convert them to decimal - and that will be unique value, describes unique state,
      //depending on which we use the corresponding function in functions[answer]

      let answer = parseInt(answers, 2);

      functions[answer].call(this);
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
