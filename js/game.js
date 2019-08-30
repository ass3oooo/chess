"use strict";

(function() {
  const BLACK = "b";
  window.BLACK = BLACK;
  const WHITE = "w";
  window.WHITE = WHITE;

  class AI { //на скорую руку, лишь бы работало
    constructor(game, side) {
      this.game = game;
      game.ai = this;

      this.side = side;
    }

    makeTurn() {
      let bestVariant = this.rateTurns();
      // console.log(bestVariant);
      let map = this.game.board.map;
      let cellToMove = map[bestVariant.turn.y][bestVariant.turn.x];
      let position = bestVariant.turn;
      let piece = bestVariant.piece;
      piece.getPossibleTurns();

      this.from = {
        x: piece.position.x,
        y: piece.position.y
      };
      this.to = {
        x: position.x,
        y: position.y
      }

      piece.moveTo(position);
    }

    rateTurns() {
      let game = this.game;
      let board = game.board;
      let map = board.map;

      let mainReport = [];

      let pieces1 = board.findPiece(elem => {
        return (elem.side === game.state._turn);
      });

      pieces1.forEach(piece1 => {
        let turns1 = piece1.getPossibleTurns(false);
        let nowIsUnderAttack = piece1.getCell().isUnderAttack({noCache: true, side: piece1.enemy});
        let base = 0;
        let baseDesc = "";

        if (nowIsUnderAttack) {
          base = piece1._cost;
          baseDesc += `находится под ударом(${base} к любому ходу) `;
          // console.log(`${piece1.side} ${piece1.type} (${piece1.position.x} ${piece1.position.y}) стоя на месте, подвергается атаке со стороны `, nowIsUnderAttack);
          // console.log(piece1);
          let isUnderProtection = piece1.getCell().isUnderAttack({noCache: true, side: piece1.side, withOutPiece: piece1});
          if (isUnderProtection) {
            let cost = nowIsUnderAttack.reduce((acc, elem) => {
              if (elem._cost < Infinity) {
                return elem._cost;
              }
            }, Infinity);
            let allyCost = isUnderProtection.reduce((acc, elem) => {
              if (elem._cost < Infinity) {
                return elem._cost;
              }
            }, Infinity);
            if (cost > allyCost) {
              cost = -cost;
              base += cost;
              baseDesc += `находится под защитой(${cost}) `;
            }
          }
        }
        turns1.forEach(turn1 => {
          let cellToMove = map[turn1.y][turn1.x];
          let savedTarget = cellToMove.piece;
          let savedThis = piece1;

          let rating = base;
          let description = `${piece1.side} ${piece1.type} (${piece1.position.x} ${piece1.position.y}) => (${turn1.x} ${turn1.y}): `;
          description += baseDesc;

          let targetAttacksAlly = false;

          if (savedTarget) {
            let targetTurns = savedTarget.getPossibleTurns(false);
            let targetAttacks = targetTurns.filter(turn => {
              return (map[turn.y][turn.x].piece === piece1.side);
            });
            if (targetAttacks && targetAttacks.length > 0) {
              targetAttacksAlly = targetAttacks;
            }
          }

          piece1.getCell().set("piece", false);
          cellToMove.set("piece", savedThis);


          let isUnderAttack = cellToMove.isUnderAttack({noCache: true, side: piece1.enemy});
          let isUnderProtection = cellToMove.isUnderAttack({noCache: true, side: piece1.side, withOutPiece: savedThis});
          // console.log(isUnderProtection, cellToMove, piece1);

          if (savedThis.type === "pawn") {
            let cost = 0.1;
            rating += cost;
            description += `пешка(${cost}) `;
          }

          if (isUnderAttack) {
            let cost = -piece1._cost;
            rating += cost;
            description += `будет под атакой(${cost}) `;

            if (isUnderProtection) {
              let cost = isUnderAttack.reduce((acc, elem) => {
                if (elem._cost < Infinity) {
                  return elem._cost;
                }
              }, Infinity);
              let allyCost = isUnderProtection.reduce((acc, elem) => {
                if (elem._cost < Infinity) {
                  return elem._cost;
                }
              }, Infinity);
              if (cost > allyCost) {
                rating += cost;
                description += `будет под защитой(${cost}) `;
              }
            }
          }

          if (targetAttacksAlly) {
            let allyCost = targetAttacksAlly.reduce((acc, elem) => {
              if (elem._cost < Infinity) {
                return elem._cost;
              } else {
                return 0;
              }
            }, Infinity);
            let cost = allyCost - piece1._cost;
            rating += cost;
            description += `уничтожит врага, который мог атаковать союзника(${cost}) `;
          }

          if (savedTarget && savedTarget.side === savedThis.enemy) {
            let cost = savedTarget._cost;
            rating += cost;
            description += `уничтожит врага(${cost}) `;
          }

          let nextTurns = cellToMove.piece.getPossibleTurns(false);
          // console.log(cellToMove, cellToMove.piece, cellToMove.piece.getPossibleTurns());
          // console.log("nextTurns", nextTurns, cellToMove, cellToMove.piece);
          // debugger;
          let nextTargets = nextTurns.filter(turn => {
            let nextTarget = map[turn.y][turn.x].piece;
            // console.log(nextTarget);
            if (nextTarget && nextTarget.side === piece1.enemy) {
              return true;
            } else {
              return false;
            }
          });
          // console.log("nextTargets: ", nextTargets);

          if (nextTargets.length > 0 && nextTargets[0] !== undefined) {
            // console.log(nextTargets);
            nextTargets.forEach(nextTarget => {
              if (nextTarget && nextTarget.position) {
                let piece = map[nextTarget.position.y][nextTarget.position.x].piece;
                let cost = nextTarget._cost;
                // console.log("nextTarget", nextTarget);
                rating += cost;
                description += `сможет атаковать врага(${cost})(${nextTarget.side} ${nextTarget.type} (${nextTarget.position.x} ${nextTarget.position.y})) `;
              }
            });
          }

          savedThis.getCell().set("piece", savedThis);
          cellToMove.set("piece", savedTarget);

          mainReport.push({description, rating, piece1, turn1});
        });

      });

      console.log(mainReport);

      let bestRating = -Infinity;
      let bestPiece;
      let bestTurn;
      let bestDescription;

      mainReport.forEach(variant => {
        // console.log(variant);
        if (variant.rating > bestRating) {
          bestRating = variant.rating;
          bestPiece = variant.piece1;
          bestTurn = variant.turn1;
          bestDescription = variant.description;
        }
      });

      console.log(`${bestPiece.side} ${bestPiece.type} (${bestPiece.position.x} ${bestPiece.position.y}) => (${bestTurn.x} ${bestTurn.y}) выбран лучшим с описанием: ${bestDescription}`);

      return {piece: bestPiece, turn: bestTurn};
    }
  }

  class Game {
    constructor() {
      this.board = new ChessBoard({game: this});

      this.board.initMap();

      this.ai = new AI(this, window.BLACK);

      generateOptions.call(this).forEach(option => {
        this.board.addPiece(option);
      });

      this.state = {
        _turn: WHITE,
        getTurn: function() {
          return this._turn;
        },
        paused: false,
        reason: false,
      };


      this.board.renderAll();

      this.switchTurn.enPassantHandler = function() {

        let piece = this.board.findPiece(elem => {
          return (elem.type === "pawn" && elem.side === this.state.getTurn()
            && elem._firstMove === 1) ? true : false;
        })[0];

        if (piece) {
          piece._firstMove = false;
        }
      }
      this.switchTurn.castling = {};

      this.pointerPosition = {};
      this.setPointerToKing();

    }

    async switchTurn() {
      let self = this.switchTurn;

      // PAUSE
      if (this.state.paused) {
        await this.state.requiredAction();
        this.board.renderAll();
      }

      // console.log("switchTurn continues...");

      this.state._turn = this.state._turn === WHITE ? BLACK : WHITE;
      //enPassantHandler следит за пешками, уязвимыми для "Взятия на проходе"
      //и запрещает воспользоваться этим ходом через ход.
      //По правилам, "Взять на проходе" можно только на следующий ход, не позднее
      self.enPassantHandler.call(this);

      //Управление рокировкой
      if (self.castling.need) {
        //Перемещение короля завершило ход, переключаем его обратно
        this.state._turn = this.state._turn === WHITE ? BLACK : WHITE;
        //Сохраняем ладью и клетку для нее в переменные
        let rook = self.castling.rook;
        let position = {
          x: self.castling.target.position.x,
          y: self.castling.target.position.y,
          force: true //Флаг для насильного перемещения ладьи,
                      //т.к. король теперь для нее - препятствие
        }
        self.castling = {}; //обнуляем управление рокировкой, иначе - рекурсия
        rook.moveTo(position); //Ладья перемещается и передает ход друшому игроку
      }

      //Тестовая фнукция
      this.switchTurn.test();

      //Сбросим закешированный список фигур для поиска, т.к. какая-то могла быть уничтожена
      this.board.findPiece.reset();
      //Сбрасываем активную фигуру, убираем подсветку с клеток перед передачей хода
      this.prevCell = false;
      this.board.clearHighlighted();
      //Указатель на короля игрока, которому передан ход
      this.setPointerToKing();
      //Вызов функции, управляющей шахом
      this.checkHandler();
      if (this.state.getTurn() === this.ai.side) {
        this.ai.makeTurn();
        if (this.ai.from && this.ai.to) {
          let from = this.ai.from;
          let to = this.ai.to;
          let map = this.board.map;
          let fromCell = map[from.y][from.x];
          let toCell = map[to.y][to.x];

          fromCell.set("isHighlighted", true, true);
          toCell.set("isHighlighted", true, true);
        }
      }
    }

    checkHandler() {
      let map = this.board.map;
      let king = this.board.findPiece(piece => {
        return (piece.type === "king" && piece.side === this.state._turn);
      })[0];

      let isUnderAttack = king.getCell().isUnderAttack({side: king.enemy});
      // console.log(isUnderAttack);

      // console.log(isUnderAttack);

      if (!isUnderAttack) {
        king.unCheck();
        return false;
      }
      // debugger;

      king.checkHandler();
    }

    clickHandler(position) {
      let currentCell = this.board.map[position.y][position.x];

      let answers = "";

      let functions = {
        "10": function() { //пред. клик на вражескую фигуру или на пустую клетку, этот клик на нашу фигуру => выбрать эту фигуру

          this.prevCell = currentCell;
          this.board.clearHighlighted();

          this.prevCell.set("isHighlighted", true, true);
          this.setPointer(this.prevCell.piece.position);
          this.prevCell.piece.highlightTurns();
        },
        "8": function() { //пред. клик на пустую клетку или пред. клика не было, этот клик на нашу фигуру => выбрать эту фигуру

          this.prevCell = false;
          this.board.clearHighlighted();

          currentCell.set("isHighlighted", true, true);
          currentCell.piece.highlightTurns();
        },
        "12": function() { //пред. клик на нашу фигуру, этот клик на вражескую => сделать ход, удалить вражескую фигуру

          if (this.prevCell.piece.isPossibleMove(position)) {


            this.prevCell.piece.moveTo(currentCell.piece.position);
          } else {
            console.log("impossible move");
          }
        },
        "4": function() { //пред.клик на любую фигуру, этот клик на пустую клетку => попробовать сделать ход

          if (this.state.getTurn() === this.prevCell.piece.side
              && this.prevCell.piece.isPossibleMove(position)) {
                console.log("move is possible");
            this.prevCell.piece.moveTo(position);
          } else {
            console.log("move to position is impossible");
            if (this.state.getTurn() !== this.prevCell.piece.side) {
              console.log("not your turn. this turn is: ", this.state.getTurn());
            }
            this.prevCell = false;
            this.board.clearHighlighted();
            this.board.renderRequiredCells();
          }



        },
        "0": function() { //пред. клик на вражескую фигуру или пустую клетку, этот - на пустую клетку => удалить предыдущую подсветку, посчитать и подсветить фигуры, которые могут атаковать эту клетку

          this.board.clearHighlighted();

          //Клик на пустую клетку подсвечивает вражеские фигуры, которые могут ее атаковать
          let pieces = this.board.map[position.y][position.x].isUnderAttack({side: enemy});
          if (pieces) {
            pieces.forEach(piece => {
              this.board.map[piece.position.y][piece.position.x].set("isHighlighted", true, true);
            });
          }
        },
        "14": function() { //пред. клик на нашу фигуру (она теперь выбрана), этот клик на другую нашу фигуру => перевыбрать новую фигуру и подсветить ее

          this.board.clearHighlighted();
          this.prevCell = currentCell;
          this.prevCell.set("isHighlighted", true, true);
          this.prevCell.piece.highlightTurns();
          this.setPointer(this.prevCell.piece.position);
        },
        "15": function() { //пред. и этот клик - на нашу фигуру (одну и ту же) => отменить выбор этот фигуры как активной

          this.prevCell = false;

          this.board.clearHighlighted();
        }
      }

      answers += (!currentCell.isEmpty()) ? "1" : "0";
      answers += (this.prevCell) ? "1" : "0";
      answers += (currentCell.piece.side === game.state.getTurn()) ? "1" : "0";
      answers += (this.prevCell && (currentCell.piece === this.prevCell.piece)) ? "1" : "0";

      //после ответа на вопросы переменная answers становится строкой в виде "1001",
      //конвертируем ее в десятичное число - и это будет уникальное значение, описывающее состояние кликов,
      //в зависимости от состояния мы вызываем соответствующую финкцию functions[answer]
      let answer = parseInt(answers, 2);
      let enemy = this.state._turn === window.BLACK ? window.WHITE : window.BLACK;
      let ally = this.state._turn;
      console.log(answers, answer);

      functions[answer].call(this);
    }

    rightClickHandler(position) {
      this.board.clearHighlighted();

      //Клик ПКМ на любую клетку подсвечивает фигуры, которые могут ее атаковать
      let enemy = this.state._turn === window.BLACK ? window.WHITE : window.BLACK;
      let pieces = this.board.map[position.y][position.x].isUnderAttack({side: enemy});
      if (pieces) {
        pieces.forEach(piece => {
          this.board.map[piece.position.y][piece.position.x].set("isHighlighted", true, true);
        });
      }
    }

    setPointerToKing() {
      let turn = this.state.getTurn();

      let king = this.board.findPiece(elem => {
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
  }

  //Создание параметров для фигур
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
  window.Game = Game;
  window.game = new Game();
})();
