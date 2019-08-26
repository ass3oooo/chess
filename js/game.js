"use strict";

(function() {
  const BLACK = "b";
  window.BLACK = BLACK;
  const WHITE = "w";
  window.WHITE = WHITE;

  class Game {
    constructor() {
      this.board = new ChessBoard({game: this});

      generateOptions.call(this).forEach(option => {
        this.board.addPiece(option);
      });

      this.state = {
        _turn: WHITE,
        getTurn: function() {
          return this._turn;
        }
      };

      this.board.updateMap();
      this.board.renderAll();

      this.switchTurn.enPassantHandler = function() {
        let piece = this.board.pieces.filter(elem => {
          return (elem.type === "pawn" && elem.side === this.state.getTurn()
            && elem._firstMove === 1) ? true : false;
        })[0];

        if (piece) {
          piece._firstMove = false;
        }
      }

      this.pointerPosition = {};
      this.setPointerToKing();

    }

    switchTurn() {
      this.state._turn = this.state._turn === WHITE ? BLACK : WHITE;
      this.switchTurn.enPassantHandler.call(this);
      this.switchTurn.test();
      this.setPointerToKing();
    }

    clickHandler(position) {
      let currentCell = this.board.map[position.y][position.x];

      let answers = "";

      let functions = {
        "10": function() { //prev click on enemy piece or on empty cell or no prev click, this on our piece => choose this piece

          this.prevCell = currentCell;
          this.board.clearHighlighted();

          this.prevCell.set("isHighlighted", true, true);
          this.setPointer(this.prevCell.piece.position);
          this.prevCell.piece.highlightTurns();
        },
        "8": function() { //prev click on empty piece or no prev click, this on our piece => choose this piece

          this.prevCell = false; //???????????????????????????
          this.board.clearHighlighted();

          currentCell.set("isHighlighted", true, true);
          currentCell.piece.highlightTurns();
        },
        "12": function() { //prev click on our piece, this on enemy piece => make turn, remove enemy piece

          if (this.prevCell.piece.isPossibleMove(position)) {
            

            this.prevCell.piece.moveTo(currentCell.piece.position);
          } else {
            console.log("impossible move");
          }
          this.prevCell = false;
          this.board.clearHighlighted();
        },
        "4": function() { //prev click on any piece, this click on empty cell => try make turn
          if (this.state.getTurn() === this.prevCell.piece.side
              && this.prevCell.piece.isPossibleMove(position)) {
                console.log("move is possible");
            this.prevCell.piece.moveTo(position);
          } else {
            console.log("move to position is impossible");
            if (this.state.getTurn() !== this.prevCell.piece.side) {
              console.log("not your turn. this turn is: ", this.state.getTurn());
            }
            this.board.renderRequiredCells();
          }

          this.prevCell = false;
          this.board.clearHighlighted();

        },
        "0": function() { // prev click on enemy, this - on empty cell. clears enemy`s possible turns
          this.board.clearHighlighted();
        },
        "14": function() { //prev click on our piece, this click on another our piece => choose this piece, then highlight

          this.board.clearHighlighted();
          this.prevCell = currentCell;
          this.prevCell.set("isHighlighted", true, true);
          this.prevCell.piece.highlightTurns();
          this.setPointer(this.prevCell.piece.position);
        },
        "15": function() { //prev click and this click on this our piece => unchoose this piece
          this.prevCell = false;

          this.board.clearHighlighted();
        }


      }

      answers += (!currentCell.isEmpty()) ? "1" : "0";
      answers += (this.prevCell) ? "1" : "0";
      answers += (currentCell.piece.side === game.state.getTurn()) ? "1" : "0";
      answers += (this.prevCell && (currentCell.piece === this.prevCell.piece)) ? "1" : "0";

      //after answer the questions, the "answers" variable becomes a string like binary number "1001",
      //convert them to decimal - and that will be unique value, describes unique state,
      //depending on which we use the corresponding function in functions[answer]

      let answer = parseInt(answers, 2);
      console.log(answers, answer);
      console.log("inClickHander", position);

      functions[answer].call(this);
    }

    setPointerToKing() {
      let turn = this.state.getTurn();
      let king = this.board.pieces.filter(elem => {
        return (elem.type === "king") && (elem.side === this.state._turn)
      })[0];

      this.setPointer(king.position);
    }

    setPointer(position) {

      if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
        return false;
      }

      let prevPosition = {
        x: this.pointerPosition.x > -1 ? this.pointerPosition.x : -1,
        y: this.pointerPosition.y > -1 ? this.pointerPosition.y : -1
      };

      this.pointerPosition = position;
      this.board.map[position.y][position.x].renderAll();
      if (prevPosition.x > -1 && prevPosition.y > -1) {
        this.board.map[prevPosition.y][prevPosition.x].renderAll();
      }
    }

    keyboardHandler(action) {
      console.log("keyboardHandler",this.pointerPosition);
      let x = this.pointerPosition.x;
      let y = this.pointerPosition.y;
      let set1 = this.setPointer.bind(this);

      let actions = {
        "left": function() {
          set1({x: x - 1, y: y});
        },
        "right": function() {
          set1({x: x + 1, y: y});
        },
        "up": function() {
          set1({x: x, y: y - 1});
        },
        "down": function() {
          set1({x: x, y: y + 1});
        },
        "downLeft": function() {
          set1({x: x - 1, y: y + 1});
        },
        "downRight": function() {
          set1({x: x + 1, y: y + 1});
        },
        "upLeft": function() {
          set1({x: x - 1, y: y - 1});
        },
        "upRight": function() {
          set1({x: x + 1, y: y - 1});
        },
        "accept": function() {
          this.clickHandler({x: x, y: y})
        },
        "cancel": function() {

        }
      }

      if (actions[action]) {
        actions[action].call(this);
      }
    }

    // parseCoords() {
    //
    //   let x = parseInt(arguments[0]["x"]);
    //   let y = parseInt(arguments[0]["y"]);
    //
    //   if (isNaN(x) || isNaN(y)) {
    //     x = parseInt(arguments[0]);
    //     y = parseInt(arguments[1]);
    //   }
    //
    //   if (isNaN(x) || isNaN(y)) {
    //     x = parseInt(arguments.x);
    //     y = parseInt(arguments.y);
    //   }
    //
    //   let position = {
    //     x: x,
    //     y: y
    //   };
    //
    //   if (isNaN(position.x) || isNaN(position.y)) {
    //     console.log("can not parse position. use ({x: 'x', y: 'y'}) or (['x', 'y']) or ('x', 'y')");
    //     console.log("Переданные в функцию параметры: ", arguments);
    //     console.log("Преобразованные параметры: ", position);
    //     return false;
    //   }
    //
    //   return position;
    // }
  }

  function generateOptions() {

    let options = [];

    options.push(gen.call(this, BLACK, "king", 4, 0));
    options.push(gen.call(this, WHITE, "king", 4, 7));

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
