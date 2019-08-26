"use strict";

(function() {

  class Piece {

    constructor(options) {
      /* options = {
            side: BLACK || WHITE,
            type: "pawn" || "elephant" || "horse" || "rook" || "queen" || "king",
            position: {
              x: [0-7],
              y: [0-7]
            },
            board: ChessBoard object
          }
      */

        this.side = options.side;
        this.enemy = this.side === window.WHITE ? window.BLACK : window.WHITE;
        this.type = options.type;
        this.position = {
          x: options.position.x,
          y: options.position.y
        }
        this.board = options.board;
        this._cachedPossibleTurns = false;


      // }

    }

    getFillColor() {
      if (this.side === window.BLACK) {
        return window.colors.pieceBlackFill || "#ffffff";
      } else {
        return window.colors.pieceWhiteFill || "#000000";
      }
    }

    getOutlineColor() {
      if (this.side === window.BLACK) {
        return window.colors.pieceBlackOutline || "#ffffff";
      } else {
        return window.colors.pieceWhiteOutline || "#000000";
      }
    }

    highlightTurns(turns) {
      if (!turns) {
        turns = this.getPossibleTurns();
        this._cachedPossibleTurns = turns;
      }
      turns.forEach(elem => {this.board.map[elem.y][elem.x].set("isHighlighted", true, true)});
    }

    render() {

      let screen = this.board.getCoordsOfPosition(this.position);
      let parameters = {
        startPoint: screen,
        points: this.getRenderingPoints(),
        offset: {x: 0, y: 5},
        fill: true,
        fillColor: this.getFillColor(),
        outlineColor: this.getOutlineColor()
      };

      window.renderByPoints(parameters);
    }

    moveTo(position) {
      //Корректировка (приведение) к правильной позиции
      // let position = this.board.game.parseCoords(...[].slice.call(arguments));
      if (!position) {
        return false;
      }
      let map = this.board.map;
      let pieces = this.board.pieces;

      let isPossible = this.isPossibleMove(position);
      let force = position.force;

      if (force) isPossible = true;

      if (isPossible) {
        //Стираем по старой позиции эту фигуру
        map[this.position.y][this.position.x].set("piece", false);

        let index = pieces.indexOf(map[position.y][position.x].piece);
        console.log(index);
        if (index > -1) {
          pieces.splice(index, 1);
        }
        //На карте по новой позиции устанавливаем эту фигуру, перезаписывая ту, что там была
        map[position.y][position.x].set("piece", this);
        //Если ходит пешка и ход - "взятие на проходе" - удаляем вражескую пешку по правилам
        if (isPossible.enPassant) {
          let index = pieces.indexOf(map[position.y][position.x].piece);
          if (index > -1) {
            pieces.splice(index, 1);
          }
          map[this.position.y][position.x].set("piece", false);
        }
        //И тут же этой фигуре устанавливаем позицию в ее свойствах
        this.position = {x: position.x, y: position.y};
        //Перерисовываем клетки, которые требуется перерисовать
        this.board.renderRequiredCells();
        //Сбрасываем закешированные возможные ходы для всех фигур
        this.clearCachedTurns();
        //Передаем ход другому игроку
        this.board.game.switchTurn();

        return true;
      } else {
        console.log("can not move to this point");
        return false;
      }
    }

    isPossibleMove(position) {
      console.log("calling piece.isPossibleMove()");
      if (!this._cachedPossibleTurns) {
        this._cachedPossibleTurns = this.getPossibleTurns();
      }

      let isPossible = false;
      for (let i = 0; i < this._cachedPossibleTurns.length; i++) {
        if (this._cachedPossibleTurns[i].x === position.x
            && this._cachedPossibleTurns[i].y === position.y) {
              isPossible = true;
              if (this._cachedPossibleTurns[i].enPassant) {
                isPossible = {enPassant: true};
              }
              break;
            }
      }

      return isPossible;
    }

    clearCachedTurns() {
      this.board.pieces.forEach(elem => {
        elem._cachedPossibleTurns = false;
      });
    }
  }

  class Pawn extends Piece {
    constructor(options) {
      super(options);
      this._firstMove = 2;//pawn can move up to 2 cells if this is first turn
    }

    moveTo(position) {
      console.log(position);
      if (this._firstMove) {
        if (Math.abs(this.position.y - position.y) === 2) {
          this._firstMove--;
        } else {
          this._firstMove = false;
        }
      }

      super.moveTo(position);
    }

    getRenderingPoints() {
      return [
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        [7, -6],
        [10, -9],
        [9, -14],
        [5, -15],
        [6, -16],
        [10, -24],
        [7, -31],
        [2, -33],

        [-2, -33],
        [-7, -31],
        [-10, -24],
        [-6, -16],
        [-5, -15],
        [-9, -14],
        [-10, -9],
        [-7, -6],
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
      ];
    }

    getPossibleTurns() {
      let turns = [];

      let left = this.position.x - 1;
      let right = this.position.x + 1;
      let forward = (this.side === window.BLACK) ? this.position.y + 1
                                                 : this.position.y - 1;

      isExist = isExist.bind(this);

      if (isExist(forward, right) && this.board.map[forward][right].piece.side === this.enemy) {
        turns.push({x: right, y: forward});
      }

      if (isExist(forward, left) && this.board.map[forward][left].piece.side === this.enemy) {
        turns.push({x: left, y: forward});
      }

      //enPassantMove
      if (isExist(this.position.y, left) && this.board.map[this.position.y][left].piece._firstMove === 1
          && this.board.map[forward]) {
        turns.push({y: forward, x: left, enPassant: true});
      }
      if (isExist(this.position.y, right) && this.board.map[this.position.y][right].piece._firstMove === 1
          && this.board.map[forward]) {
        turns.push({y: forward, x: right, enPassant: true});
      }

      if (this.board.map[forward] && this.board.map[forward][this.position.x].isEmpty()) {
        turns.push({x: this.position.x, y: forward});
      }
      if (this._firstMove && this.board.map[forward][this.position.x].isEmpty()) {
        turns.push({x: this.position.x, y: (this.side === window.BLACK) ? forward + 1 : forward - 1});
      }

      return turns;

      function isExist(forward, side) {
        if (this.board.map[forward] && this.board.map[forward][side]) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  class Elephant extends Piece {
    constructor(options) {
      super(options);
    }

    getRenderingPoints() {
      return [
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        [10, -2],
        [16, -2],
        [16, -6],
        [8, -9],
        [11, -18],
        [9, -24],
        [3, -32],
        [5, -36],
        [1, -40],

        [-1, -40],
        [-5, -36],
        [-3, -32],
        [-9, -24],
        [-11, -18],
        [-8, -9],
        [-16, -6],
        [-16, -2],
        [-10, -2],
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
      ]
    }

    getPossibleTurns() {
      let turns = [];

      let obstacles = {
        leftTop: false, //left top
        leftBottom: false, //left bottom
        rightTop: false, //right top
        rightBottom: false  //right bottom
      }
      let x = this.position.x;
      let y = this.position.y;

      for (let i = 1; i < 8 && !obstacles["leftTop"]; i++) {
        let x1 = x - i;
        let y1 = y - i;
        if (x1 < 0 || y1 < 0) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["leftTop"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["leftBottom"]; i++) {
        let x1 = x - i;
        let y1 = y + i;
        if (x1 < 0 || y1 > 7) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["leftBottom"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["rightTop"]; i++) {
        let x1 = x + i;
        let y1 = y - i;
        if (x1 > 7 || y1 < 0) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["rightTop"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["rightBottom"]; i++) {
        let x1 = x + i;
        let y1 = y + i;
        if (x1 > 7 || y1 > 7) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["rightBottom"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }

      return turns;
    }
  }
  // end class

  class Horse extends Piece {
    constructor(options) {
      super(options);
    }

    getRenderingPoints() {
      return [
        // основание
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        // /основание

        [16, 7],
        [16, 4],
        [13, -4],
        [3, -15],
        [7, -16],
        [9, -17],
        [12, -17],
        [15, -15],
        [20, -19],
        [20, -22],
        [18, -25],
        [8, -33],
        [3, -34],
        [3, -41],
        [2, -41],
        [-5, -36],
        [-6, -33],
        [-16, -22],
        [-18, -18],
        [-17, -13],
        [-12, 7],

        // основание
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
        // /основание
      ];
    }

    getPossibleTurns() {
      let turns = [
        {x: this.position.x - 2, y: this.position.y - 1},
        {x: this.position.x - 2, y: this.position.y + 1},
        {x: this.position.x + 2, y: this.position.y - 1},
        {x: this.position.x + 2, y: this.position.y + 1},
        {x: this.position.x - 1, y: this.position.y - 2},
        {x: this.position.x + 1, y: this.position.y - 2},
        {x: this.position.x - 1, y: this.position.y + 2},
        {x: this.position.x + 1, y: this.position.y + 2},
      ];

      return turns.filter(elem => {
        if (elem.x < 8 && elem.x > -1 && elem.y < 8 && elem.y > -1
            && this.board.map[elem.y][elem.x].piece.side !== this.side) {
              return true;
        } else {
          return false;
        }
      });
    }
  }
  // end class

  class Rook extends Piece {
    constructor(options) {
      super(options);
    }

    getRenderingPoints() {
      return [
        // основание
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        // /основание

        [10, -1],
        [7, -8],
        [6, -9],
        [10, -10],
        [10, -14],
        [6, -15],
        [6, -19],
        [15, -19],
        [16, -20],
        [16, -33],
        [15, -35],
        [12, -35],
        [12, -29],
        [10, -28],
        [8, -28],
        [6, -29],
        [6, -35],

        [-6, -35],
        [-6, -29],
        [-8, -28],
        [-10, -28],
        [-12, -29],
        [-12, -35],
        [-15, -35],
        [-16, -33],
        [-16, -20],
        [-15, -19],
        [-6, -19],
        [-6, -15],
        [-10, -14],
        [-10, -10],
        [-6, -9],
        [-7, -8],
        [-10, -1],

        // основание
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
        // /основание
      ];
    }

    getPossibleTurns() {
      let turns = [];

      let obstacles = {
        left: false,
        top: false,
        right: false,
        bottom: false
      }
      let x = this.position.x;
      let y = this.position.y;

      for (let i = 1; i < 8 && !obstacles["left"]; i++) {
        let x1 = x - i;
        if (x1 < 0) break;
        let nextCell = this.board.map[y][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["left"] = true;
          }
          turns.push({x: x1, y: y});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["right"]; i++) {
        let x1 = x + i;
        if (x1 > 7) break;
        let nextCell = this.board.map[y][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["right"] = true;
          }
          turns.push({x: x1, y: y});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["top"]; i++) {
        let y1 = y - i;
        if (y1 < 0) break;
        let nextCell = this.board.map[y1][x];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["top"] = true;
          }
          turns.push({x: x, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["bottom"]; i++) {
        let y1 = y + i;
        if (y1 > 7) break;
        let nextCell = this.board.map[y1][x];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["bottom"] = true;
          }
          turns.push({x: x, y: y1});
        } else {
          break;
        }
      }

      return turns;
    }
  }
  // end class

  class Queen extends Piece {
    constructor(options) {
      super(options);
    }

    getRenderingPoints() {
      return [
        // основание
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        // /основание

        [15, 7],
        [8, -3],
        [7, -3],
        [7, -6],
        [14, -6],
        [17, -9],
        [17, -11],
        [14, -14],
        [11, -14],
        [11, -15],
        [21, -26],
        [21, -29],
        [2, -29],
        [4, -31],
        [5, -33],
        [4, -35],
        [2, -37],

        [-2, -37],
        [-4, -35],
        [-5, -33],
        [-4, -31],
        [-2, -29],
        [-21, -29],
        [-21, -26],
        [-11, -15],
        [-11, -14],
        [-14, -14],
        [-17, -11],
        [-17, -9],
        [-14, -6],
        [-7, -6],
        [-7, -3],
        [-8, -3],
        [-15, 7],

        // основание
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
        // /основание
      ];
    }

    getPossibleTurns() {
      let turns = [];

      let obstacles = {
        leftTop: false, //left top
        leftBottom: false, //left bottom
        rightTop: false, //right top
        rightBottom: false,  //right bottom
        left: false,
        top: false,
        right: false,
        bottom: false
      }
      let x = this.position.x;
      let y = this.position.y;

      for (let i = 1; i < 8 && !obstacles["left"]; i++) {
        let x1 = x - i;
        if (x1 < 0) break;
        let nextCell = this.board.map[y][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["left"] = true;
          }
          turns.push({x: x1, y: y});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["right"]; i++) {
        let x1 = x + i;
        if (x1 > 7) break;
        let nextCell = this.board.map[y][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["right"] = true;
          }
          turns.push({x: x1, y: y});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["top"]; i++) {
        let y1 = y - i;
        if (y1 < 0) break;
        let nextCell = this.board.map[y1][x];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["top"] = true;
          }
          turns.push({x: x, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["bottom"]; i++) {
        let y1 = y + i;
        if (y1 > 7) break;
        let nextCell = this.board.map[y1][x];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["bottom"] = true;
          }
          turns.push({x: x, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["leftTop"]; i++) {
        let x1 = x - i;
        let y1 = y - i;
        if (x1 < 0 || y1 < 0) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["leftTop"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["leftBottom"]; i++) {
        let x1 = x - i;
        let y1 = y + i;
        if (x1 < 0 || y1 > 7) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["leftBottom"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["rightTop"]; i++) {
        let x1 = x + i;
        let y1 = y - i;
        if (x1 > 7 || y1 < 0) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["rightTop"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }
      for (let i = 1; i < 8 && !obstacles["rightBottom"]; i++) {
        let x1 = x + i;
        let y1 = y + i;
        if (x1 > 7 || y1 > 7) {
          break;
        }
        let nextCell = this.board.map[y1][x1];
        if (nextCell.isEmpty() || nextCell.piece.side === this.enemy) {
          if (nextCell.piece.side === this.enemy) {
            obstacles["rightBottom"] = true;
          }
          turns.push({x: x1, y: y1});
        } else {
          break;
        }
      }


      return turns;
    }
  }
  // end class
  class King extends Piece {
    constructor(options) {
      super(options);
    }

    getRenderingPoints() {
      return [
        // основание
        [0, 25],
        [22, 25],
        [22, 21],
        [17, 16],
        [20, 15],
        [22, 13],
        [20, 10],
        [15, 9],
        // /основание

        [15, -7],
        [7, -4],
        [7, -7],
        [13, -7],
        [15, -9],
        [15, -11],
        [13, -13],
        [11, -13],
        [11, -14],
        [19, -22],
        [19, -27],
        [21, -29],
        [22, -31],
        [21, -33],
        [19, -35],
        [17, -35],
        [15, -33],
        [14, -31],
        [15, -29],
        [13, -27],
        [10, -24],
        [1, -33],
        [1, -34],
        [3, -36],
        [4, -38],
        [3, -40],
        [1, -42],

        [-1, -42],
        [-3, -40],
        [-4, -38],
        [-3, -36],
        [-1, -34],
        [-1, -33],
        [-10, -24],
        [-13, -27],
        [-15, -29],
        [-14, -31],
        [-15, -33],
        [-17, -35],
        [-19, -35],
        [-21, -33],
        [-22, -31],
        [-21, -29],
        [-19, -27],
        [-19, -22],
        [-11, -14],
        [-11, -13],
        [-13, -13],
        [-15, -11],
        [-15, -9],
        [-13, -7],
        [-7, -7],
        [-7, -4],
        [-15, -7],

        // основание
        [-15, 9],
        [-20, 10],
        [-22, 13],
        [-20, 15],
        [-17, 16],
        [-22, 21],
        [-22, 25],
        [0, 25],
        // /основание
      ];
    }

    getPossibleTurns() {

      let turns = [];

      let x = this.position.x;
      let y = this.position.y;

      {
        let x1 = x + 1;
        if (x1 < 8) {
          let nextCell = this.board.map[y][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y})
          }
        }
      }
      {
        let x1 = x - 1;
        if (x1 > -1) {
          let nextCell = this.board.map[y][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y})
          }
        }
      }
      {
        let y1 = y - 1;
        if (y1 > -1) {
          let nextCell = this.board.map[y1][x];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x, y: y1})
          }
        }
      }
      {
        let y1 = y + 1;
        if (y1 < 8) {
          let nextCell = this.board.map[y1][x];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x, y: y1})
          }
        }
      }
      {
        let y1 = y + 1;
        let x1 = x + 1;
        if (y1 < 8 && x1 < 8) {
          let nextCell = this.board.map[y1][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y1})
          }
        }
      }
      {
        let y1 = y + 1;
        let x1 = x - 1;
        if (y1 < 8 && x1 > -1) {
          let nextCell = this.board.map[y1][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y1})
          }
        }
      }
      {
        let y1 = y - 1;
        let x1 = x - 1;
        if (y1 > -1 && x1 > -1) {
          let nextCell = this.board.map[y1][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y1})
          }
        }
      }
      {
        let y1 = y - 1;
        let x1 = x + 1;
        if (y1 > -1 && x1 < 8) {
          let nextCell = this.board.map[y1][x1];
          if (nextCell.piece.side !== this.side) {
            turns.push({x: x1, y: y1})
          }
        }
      }

      let enemyKing = (this.board.pieces[0].side === this.enemy)
                      ? this.board.pieces[0]
                      : this.board.pieces[1];

      let enemyX = enemyKing.position.x;
      let enemyY = enemyKing.position.y;
      let enemyKingField = [
        [enemyX, enemyY],
        [enemyX - 1, enemyY],
        [enemyX + 1, enemyY],
        [enemyX, enemyY - 1],
        [enemyX, enemyY + 1],
        [enemyX + 1, enemyY + 1],
        [enemyX - 1, enemyY + 1],
        [enemyX + 1, enemyY - 1],
        [enemyX - 1, enemyY - 1],
      ];

      return turns.filter(elem => { //filters turns which is in range 1 cell from enemy king
        let result = true;          // in chesses this turn impossible
        for (let i = 0; i < enemyKingField.length; i++) {
          if (elem.x === enemyKingField[i][0] && elem.y === enemyKingField[i][1]) {
            result = false;
            break;
          }
        }
        return result;
      });
    }
  }
  // end class

  const PIECES = {
    pawn: Pawn,
    elephant: Elephant,
    horse: Horse,
    rook: Rook,
    queen: Queen,
    king: King
  };

  window.Pieces = PIECES;
  window.Pieces.checkInitParameters = function(options) {
    if (!options) {
      console.log("empty options of piece init");
      return false;
    }
    if (!(options.side === window.BLACK || options.side === window.WHITE)) {
      console.log("wrong side of piece");
      return false;
    }
    if (!PIECES[options.type]) {
      console.log("wrong type of piece");
      console.log(options);
      return false;
    }
    if (options.position.x >= 8
      || options.position.x < 0
      || options.position.y >= 8
      || options.position.y < 0) {
        console.log("wrong position of piece");
        return false;
      }

      return true;
    }
})();
