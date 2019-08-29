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
  }

  isEmpty() {
    return this.piece ? false : true;
  }

  isUnderAttack(options = false) {
    // console.log("options in isUnderAttack", options);
    // options = {
    //   only: ["pawn", "horse"...],
    //   withOut: ["king", "queen"...],
    //   side: BLACK || WHITE
    //   noCache: true || false
    // }
    let result = [];
    let savePiece = this.piece;
    let noCache = options.noCache;

    let pieces = this.board.findPiece(piece => {
      if (options.side && options.side !== piece.side) {
        return false;
      }
      if (piece.enemy !== this.board.game.state._turn) {
        return false;
      }
      if (options.withOut && options.withOut.includes(piece.type)) {
        return false;
      }
      if (options.only && !options.only.includes(piece.type)) {
        return false;
      }
      return true;
    }, noCache);

    // console.log(pieces);


    pieces.forEach(piece => {
      this.set("piece", {side: piece.enemy, type: "pawn", _firstMove: false}); //Виртуальная пешка, для всех враг
      piece.getPossibleTurns();
      // console.log(this.position.x, this.position.y, this.piece);
      if (!piece._cachedPossibleTurns.length > 0){
        // debugger;

      }
      // try {
      // console.log(piece);
        // piece._cachedPossibleTurns.forEach(turn => {
        piece.getPossibleTurns().forEach(turn => {
          // console.log(this, turn);
          if (this.position.x === turn.x && this.position.y === turn.y) {
            result.push(piece);
          }
          if (turn.enPassant) {
            if (piece.position.y === this.position.y
              && (piece.position.x - 1 === this.position.x || piece.position.x + 1 === this.position.x)) {
                result.push(piece);
              }
            }
          });
      // } catch (e) {
      //   return false;
      // }
    });

    // console.log("isUnderAttack", this, this.board.map[0][4].piece);

    // console.log("result", result);

    this.set("piece", savePiece);

    return result.length > 0 ? result : false;
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

    this.map = [];
    this.game = options.game;
  }

  addPiece(options) {
    if (window.Pieces.checkInitParameters(options)) {
      let piece = new window.Pieces[options.type](options);
      this.map[piece.position.y][piece.position.x].set("piece", piece);
      return piece;
    }
  }

  findPiece(cb, noCache) {

    if (!this.findPiece.reset) {
      let self = this;
      this.findPiece.reset = function() {
        self.findPiece._cachedResult = false;
      }
    }
    let result = [];
    if (!noCache) {
      if (!this.findPiece._cachedResult) {
        this.findPiece._cachedResult = [];
        this.map.forEach(row => {
          row.forEach(elem => {
            if (elem.piece) this.findPiece._cachedResult.push(elem.piece);
          });
        });
      }

      result = this.findPiece._cachedResult.slice();
    } else {
      this.map.forEach(row => {
        row.forEach(elem => {
          if (elem.piece) result.push(elem.piece);
        })
      })
    }


    result = result.filter(cb);

    return result;
  }

  getAllPieces() {
    return this.findPiece(elem => {return elem});
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

  initMap() {

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
