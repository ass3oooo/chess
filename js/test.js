"use strict";

let board = new ChessBoard();

let opt1 = {
  side: "b",
  type: "pawn",
  position: {
    x: 0,
    y: 0
  },
  board: board,
}
let opt2 = {
  side: "w",
  type: "pawn",
  position: {
    x: 5,
    y: 7
  },
  board: board,
}
let opt3 = {
  side: "b",
  type: "pawn",
  position: {
    x: 4,
    y: 7
  },
  board: board,
}

let optElephant1 = {
  side: "w",
  type: "elephant",
  position: {
    x: 2,
    y: 0
  },
  board: board,
}

let optHorse1 = {
  side: "b",
  type: "horse",
  position: {
    x: 1,
    y: 0
  },
  board: board,
}

let optRook1 = {
  side: "b",
  type: "rook",
  position: {
    x: 7,
    y: 0
  },
  board: board,
}

let optQueen1 = {
  side: "b",
  type: "queen",
  position: {
    x: 3,
    y: 0
  },
  board: board,
}

let optKing1 = {
  side: "b",
  type: "king",
  position: {
    x: 4,
    y: 0
  },
  board: board,
}

let wrongOpt = {
  side: "b",
  type: "queen",
  position: {
    x: 4,
    y: 7
  },
  board: board,
}

board.render();

let pawn1 = board.addPiece(opt1);
let pawn2 = board.addPiece(opt2);
let pawn3 = board.addPiece(opt3);
let elephant1 = board.addPiece(optElephant1);
let horse1 = board.addPiece(optHorse1);
let rook1 = board.addPiece(optRook1);
let queen1 = board.addPiece(optQueen1);
let king1 = board.addPiece(optKing1);

board.renderPieces();
