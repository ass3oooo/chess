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
        this.type = options.type;
        this.position = {
          x: options.position.x,
          y: options.position.y
        }
        this.board = options.board;

        if (options.side === "b") {
          this.fillColor = window.colors.pieceBlackFill || "#000000";
          this.outlineColor = window.colors.pieceBlackOutline || "#ffffff";
        } else {
          this.fillColor = window.colors.pieceWhiteFill || "#ffffff";
          this.outlineColor = window.colors.pieceWhiteOutline || "#000000";
        }
      // }

    }

    filterOutMapCoords(point) {
      return (point.x > -1 && point.x < 8 && point.y > -1 && point.y < 8) ? true : false;
    }

    highlightTurns(turns) {
      if (!turns) {
        turns = this.getPossibleTurns().filter(this.filterOutMapCoords);
      }
      turns.forEach(elem => {window.highlightCell.call(this.board, elem)});
    }

    render() {

      let screen = this.board.getCoordsOfPosition(this.position);
      let parameters = {
        startPoint: screen,
        points: this.getRenderingPoints(),
        offset: {x: 0, y: 5},
        fill: true,
        fillColor: this.fillColor,
        outlineColor: this.outlineColor
      };

      window.renderByPoints(parameters);
    }

    moveTo() {
      //Корректировка (приведение) к правильной позиции
      let position = {};

      if (arguments[0]["x"] + 1 && arguments[0]["x"] + 1) {
        // console.log("first if");

        position.x = parseInt(arguments[0]["x"]);
        position.y = parseInt(arguments[0]["y"]);

      } else if (arguments[0] + 1 && arguments[1] + 1) {
        // console.log("second if");

        position.x = parseInt(arguments[0]);
        position.y = parseInt(arguments[1]);

      } else if (arguments.x + 1 && arguments.y + 1) {
        // console.log("third if");

        position.x = parseInt(arguments.x);
        position.y = parseInt(arguments.y);

      }

      if (isNaN(position.x) || isNaN(position.y)) {
        console.log("can not parse position. use ({x: 'x', y: 'y'}) or (['x', 'y']) or ('x', 'y')");
        console.log("Переданные в функцию параметры: ", arguments);
        console.log("Преобразованные параметры: ", position);
        return false;
      }


      //проверка допустимости позиции
      if (position.x >= 8 || position.x < 0 || position.y >= 8 || position.y < 0) {
        console.log("Недопустимая позиция для перемещения: за пределами карты.");
        console.log("Переданные в функцию параметры: ", arguments);
        console.log("Преобразованные параметры: ", position);
        return false;
      }


      this.board.updateMapSingle(this, position);
      this.position = position;
      this.board.render();
      this.board.renderPieces();
    }
  }

  class Pawn extends Piece {
    constructor(options) {
      super(options);
      this._firstMove = true;//pawn can move up to 2 cells if this is first her turn
    }

    moveTo(position) {
      if (this._firstMove) {
        this._firstMove = false;
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
      let forward = (this.side === "b") ? this.position.y + 1
                                        : this.position.y - 1;


      if (this.board.map[forward][right].side === "w") {
        turns.push({x: right, y: forward});
      }

      if (this.board.map[forward][left].side === "w") {
        turns.push({x: left, y: forward});
      }
      if (!this.board.map[forward][this.position.x]) {
        turns.push({x: this.position.x, y: forward});
      }
      if (this._firstMove && !this.board.map[forward][this.position.x]) {
        turns.push({x: this.position.x, y: (this.side === "b") ? forward + 1 : forward - 1});
      }

      return turns.filter(this.filterOutMapCoords);
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
        // leftUp = true || false,
        // leftDown = true || false,
        // rightUp = true || false,
        // rightDown = true || false
      };

      for (let i = 1; i < 8; i++) {

        let left = this.position.x - 1 * i;
        // left = left < -1 ?
        let right = this.position.x + 1 * i;
        let up = this.position.y - 1 * i;
        let down = this.position.y + 1 * i;

        // if (!obstacles["rightUp"] && (this.board.map[up][right].side === "w" || !this.board.map[up][right])) {
          // if (this.board.map[up][right].side === "w") {
            // obstacles["rightUp"] = true;
          // }
          turns.push({x: right, y: up});
        // }
        // if (!obstacles["leftUp"] && (this.board.map[up][left].side === "w" || !this.board.map[up][left])) {
        //   if (this.board.map[up][left].side === "w") {
        //     obstacles["leftUp"] = true;
        //   }
          turns.push({x: left, y: up});
        // }
        // if (!obstacles["leftDown"] && (this.board.map[down][left].side === "w" || !this.board.map[down][left])) {
          // if (this.board.map[down][left].side === "w") {
            // obstacles["leftDown"] = true;
          // }
          turns.push({x: left, y: down});
        // }
        // if (!obstacles["rightDown"] && (this.board.map[down][right].side === "w" || !this.board.map[down][right])) {
          // if (this.board.map[down][right].side === "w") {
            // obstacles["rightDown"] = true;
          // }
          turns.push({x: right, y: down});
        // }
      }

      return turns.filter(this.filterOutMapCoords);
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

      return turns.filter(this.filterOutMapCoords);
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

      for (let i = 1; i < 8; i++) {
        turns.push({x: this.position.x + i, y: this.position.y});
        turns.push({x: this.position.x - i, y: this.position.y});
        turns.push({x: this.position.x, y: this.position.y + i});
        turns.push({x: this.position.x, y: this.position.y - i});
      }

      return turns.filter(this.filterOutMapCoords);
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

      for (let i = 1; i < 8; i++) {
        turns.push({x: this.position.x + i, y: this.position.y});
        turns.push({x: this.position.x + i, y: this.position.y + i});
        turns.push({x: this.position.x, y: this.position.y + i});
        turns.push({x: this.position.x - i, y: this.position.y + i});
        turns.push({x: this.position.x - i, y: this.position.y});
        turns.push({x: this.position.x - i, y: this.position.y - i});
        turns.push({x: this.position.x, y: this.position.y - i});
        turns.push({x: this.position.x + i, y: this.position.y - i});
      }

      return turns.filter(this.filterOutMapCoords);
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
      let turns = [
        {x: this.position.x + 1, y: this.position.y},
        {x: this.position.x + 1, y: this.position.y + 1},
        {x: this.position.x, y: this.position.y + 1},
        {x: this.position.x - 1, y: this.position.y + 1},
        {x: this.position.x - 1, y: this.position.y},
        {x: this.position.x - 1, y: this.position.y - 1},
        {x: this.position.x, y: this.position.y - 1},
        {x: this.position.x + 1, y: this.position.y - 1}
      ];

      return turns.filter(this.filterOutMapCoords);
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
    if (!(options.side === "b" || options.side === "w")) {
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
