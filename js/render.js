"use strict";

(function() {
  window.ctx = canvas.getContext("2d");
})();

(function() {

  function renderByPoints(options = {
                                    startPoint: {x: 0, y: 0},
                                    points: [],
                                    offset: {x: 0, y: 0},
                                    fill: false,
                                    fillColor: "black",
                                    outlineColor: "black"
                                  }) {

    // Функция рисует обект по заданным точкам,
    // каждая координата для отрисовки в options.points[..., [x, y], ...] - это точка относительно центра отрисовки startPoint,
    // а не относительно предыдущей точки.



    let prevFillColor = ctx.fillStyle;
    let prevStrokeColor = ctx.strokeStyle;

    ctx.strokeStyle = options.outlineColor;

    ctx.beginPath();
    // Установка курсора на первую точку, иначе будет линия из центра (startPoint) до первой точки
    ctx.moveTo(options.points[0] + options.startPoint.x + options.offset.x,
               options.points[1] + options.startPoint.y + options.offset.y);

    options.points.forEach(point => {
      ctx.lineTo(point[0] + options.startPoint.x + options.offset.x, point[1] + options.startPoint.y + options.offset.y);
    });

    ctx.stroke();
    if (options.fill) {
      ctx.fillStyle = options.fillColor;
      ctx.fill();
    }

    ctx.fillStyle = prevFillColor;
    ctx.strokeStyle = prevStrokeColor;
  }

  function highlightCell(position) {
    // position = {
    //   x: "x"cell,
    //   y: "y"cell
    // }

    let cellwidth = this._cellwidth;
    position = {
      x: position.x * cellwidth,
      y: position.y * cellwidth
    };

    for (let i = 0; i < 6; i++) {
      let from1 = {
        y: position.y,
        x: position.x + cellwidth * i / 6
      };
      let to1 = {
        y: (1 - i / 6) * cellwidth + position.y,
        x: cellwidth + position.x
      }


      let from2 = {
        x: position.x,
        y: position.y + cellwidth * i / 6
      };
      let to2 = {
        x: (1 - i / 6) * cellwidth + position.x,
        y: cellwidth + position.y
      }

      ctx.strokeStyle = "red";

      ctx.beginPath();
      ctx.moveTo(from1.x, from1.y);
      ctx.lineTo(to1.x, to1.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(from2.x, from2.y);
      ctx.lineTo(to2.x, to2.y);
      ctx.stroke();
    }
  }

  function highlightKeyboardPointer(position) {
    ctx.fillStyle = window.colors.keyboardPointer;

    let cellwidth = this._cellwidth;
    let x = position.x * cellwidth;
    let y = position.y * cellwidth;
    let outlineWidth = cellwidth / 20;

    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellwidth, y);
      ctx.lineTo(x + cellwidth, y + outlineWidth);
      ctx.lineTo(x, y + outlineWidth);
      ctx.lineTo(x, y);
      ctx.fill();

      ctx.beginPath();
      ctx.lineTo(x, y + cellwidth);
      ctx.lineTo(x + outlineWidth, y + cellwidth);
      ctx.lineTo(x + outlineWidth, y);
      ctx.lineTo(x, y);
      ctx.fill();

      x = x + cellwidth;
      y = y + cellwidth;
      cellwidth = -cellwidth;
      outlineWidth = -outlineWidth;
    }
  }


  window.renderByPoints = renderByPoints;
  window.highlightCell = highlightCell;
  window.highlightKeyboardPointer = highlightKeyboardPointer;
})();
