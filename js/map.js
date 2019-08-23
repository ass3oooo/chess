"use strict";

class ChessBoard {
  constructor() {
    this._side = 640;
    this._cells = 8;
    this._cellwidth = this._side / this._cells;

    this.pieces = [];
    this.map = [];
  }

  addPiece(options) {
    if (window.Pieces.checkInitParameters(options)) {
      let piece = new window.Pieces[options.type](options);
      this.pieces.push(piece);
      return piece;
    }
  }

  render() {
    let cw = this._cellwidth;

    ctx.fillStyle = "#80500d";
    ctx.fillRect(0, 0, this._side, this._side);
    ctx.fillStyle = "black";

    for (let i = 0; i < this._cells; i++) {
      for (let j = (i + 1) % 2; j < this._cells; j += 2) {
        ctx.fillRect(j * cw, i * cw, cw, cw);
      }
    }
  }

  renderPieces() {
    this.pieces.forEach(piece => {
      piece.render();
    })
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
        this.map[x].push(false);
      }
    }

    this.pieces.forEach(piece => {
      this.map[piece.position.y][piece.position.x] = piece;
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
