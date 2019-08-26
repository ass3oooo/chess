"use strict";

class BoardCell {
  constructor(options) {
    this._isBlack = options.isBlack;
    this._needRender = true;
    this.isHighlighted = false;
    this.piece = options.piece || false;
    this.board = options.board;
    this.position = {
      x: options.x,
      y: options.y
    }

    // {isBlack: true, board: game.board, x: 2, y: 2}
  }

  isEmpty() {
    return this.piece ? false : true;
  }

  set(prop, value, forceRender = false) {
    if (prop) {
      this[prop] = value;
      this._needRender = true;
    }
    if (forceRender) {
      this.renderAll();
    }
  }

  renderBackground() {
    let cw = this.board._cellwidth;

    ctx.fillStyle = (this._isBlack) ? window.colors.mapBlackCell
                                    : window.colors.mapWhiteCell;
    ctx.fillRect(this.position.x * cw, this.position.y * cw, cw, cw);
  }

  renderAll() {
    this.renderBackground();
    if (this.isHighlighted) {
      window.highlightCell.call(this.board, this.position);
    }

    let pointerPosition = this.board.game.pointerPosition;

    if (pointerPosition && pointerPosition.x === this.position.x
        && pointerPosition.y === this.position.y) {
      if (window.highlightKeyboardPointer) {
        window.highlightKeyboardPointer.call(this.board, this.position);
      } else {
        console.log("keyboard pointer sets to this cell, but window.highlightKeyboardPointer is false");
      }
    }
    if (!this.isEmpty()) {
      this.piece.render();
    }

    this._needRender = false;
  }
}

class ChessBoard {
  constructor(options) {
    this._side = 640;
    this._cells = 8;
    this._cellwidth = this._side / this._cells;

    this.pieces = [];
    this.map = [];
    this.game = options.game;
  }

  addPiece(options) {
    if (window.Pieces.checkInitParameters(options)) {
      let piece = new window.Pieces[options.type](options);
      this.pieces.push(piece);
      return piece;
    }
  }

  renderAll() {
    this.map.forEach(row => {
      row.forEach(cell => {
        cell.renderAll();
      })
    });
  }

  renderRequiredCells() {
    this.map.forEach(row => {
      row.forEach(cell => {
        if (cell._needRender) {
          cell.renderAll();
        }
      })
    })
  }

  clearHighlighted() {
    this.map.forEach(row => {
      row.forEach(cell => {
        if (cell.isHighlighted) {
          cell.set("isHighlighted", false, true);
        }
      });
    });
  }

  renderPieces() {
    this.pieces.forEach(piece => {
      piece.render();
    });
  }

  consolePieces(side = false) {
    if (!(side === "b" || side === "w")) {
      console.log(this.pieces);
    } else {
      console.log(this.pieces.filter(elem => {
        return elem.side === side;
      }));
    }
  }

  updateMap() {

    this.map = [];

    for (let x = 0; x < 8; x++) {

      this.map.push([]);

      for (let y = 0; y < 8; y++) {
        let cellOptions = {
          board: this,
          x: y,
          y: x,
          isBlack: ((x%2 || y%2) && !(x%2 && y%2)) ? true : false,
        };

        this.map[x].push(new BoardCell(cellOptions));
      }
    }

    this.pieces.forEach(piece => {
      this.map[piece.position.y][piece.position.x].set("piece", piece);
    });

  }

  updateMapSingle(piece, newPosition) {
    this.map[piece.position.y][piece.position.x] = false;
    this.map[newPosition.y][newPosition.x] = piece;
  }


  getCoordsOfPosition(position) {
    return {
      x: Math.floor(position.x * this._cellwidth + this._cellwidth / 2),
      y: Math.floor(position.y * this._cellwidth + this._cellwidth / 2)
    };
  }
}
