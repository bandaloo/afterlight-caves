import {
  getContext,
  getCanvasWidth,
  getCanvasHeight,
  getTotalTime,
  getCameraOffset,
  getScreenDimensions
} from "../modules/gamemanager.js";
import { griderate, clamp } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { blockField, GemEnum } from "./generator.js";
import { getCell } from "../modules/collision.js";

// this is to get rid of weird lines when moving the camera
const overDraw = 0.5;

/**
 * Draws an octagon centered at a particular point
 * @param {Vector} centerVec
 * @param {number} sideLength
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 * @param {number} [chamferPercent = 0.5] 0-1, what proportion of the side
 * length is included in the chamfer (diagonal edge). 0 creates a square, 1
 * creates a diamond
 */
export function centeredOctagon(
  centerVec,
  sideLength,
  fillStyle,
  strokeStyle,
  lineWidth,
  chamferPercent = 0.5
) {
  const context = getContext();
  context.save();
  centerVec = centerVec.add(getCameraOffset());

  if (chamferPercent < 0 || chamferPercent > 1)
    throw new RangeError("chamferPercent must be in the range 0..1 inclusive");

  /*
   *    8---1
   *   /     \
   *  7       2
   *  |   c   |
   *  6       3
   *   \     /
   *    5---4
   */
  const flatSideLength = sideLength * (1 - chamferPercent);
  const x1 = centerVec.x - sideLength / 2;
  const x2 = centerVec.x - flatSideLength / 2;
  const x3 = centerVec.x + flatSideLength / 2;
  const x4 = centerVec.x + sideLength / 2;
  const y1 = centerVec.y - sideLength / 2;
  const y2 = centerVec.y - flatSideLength / 2;
  const y3 = centerVec.y + flatSideLength / 2;
  const y4 = centerVec.y + sideLength / 2;

  context.beginPath();
  context.moveTo(x3, y1); // p1
  context.lineTo(x4, y2); // p2
  context.lineTo(x4, y3); // p3
  context.lineTo(x3, y4); // p4
  context.lineTo(x2, y4); // p5
  context.lineTo(x1, y3); // p6
  context.lineTo(x1, y2); // p7
  context.lineTo(x2, y1); // p8
  context.closePath();
  context.closePath();

  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  if (strokeStyle !== undefined && lineWidth !== undefined && lineWidth !== 0) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  // reset to original values
  context.restore();
}

/**
 * Draws an ellipse
 * @param {Vector} centerVec
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 */
export function ellipse(
  centerVec,
  radiusX,
  radiusY,
  fillStyle,
  lineWidth,
  strokeStyle
) {
  const context = getContext();
  context.save();
  centerVec = centerVec.add(getCameraOffset());

  // account for border
  if (lineWidth === undefined) lineWidth = 0;
  radiusX -= lineWidth / 2;
  radiusY -= lineWidth / 2;

  context.beginPath();
  context.ellipse(
    centerVec.x,
    centerVec.y,
    radiusX,
    radiusY,
    0,
    0,
    Math.PI * 2,
    false
  );

  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  if (strokeStyle !== undefined && lineWidth !== undefined && lineWidth !== 0) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  // reset to original values
  context.restore();
}

/**
 * Draws a circle centered at a particular point
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 */
export function circle(centerVec, radius, fillStyle, lineWidth, strokeStyle) {
  ellipse(centerVec, radius, radius, fillStyle, lineWidth, strokeStyle);
}

/**
 * draw a centered rectangle, optionally with fill and border, at position
 * @param {Vector} centerVec
 * @param {number} width including border
 * @param {number} height including border
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 */
export function centeredRect(
  centerVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth
) {
  centeredRoundedRect(
    centerVec,
    width,
    height,
    fillStyle,
    strokeStyle,
    lineWidth,
    0
  );
}

/**
 * Draw a centered, rounded rectangle, optionally with fill and border, at
 * position.
 * @param {Vector} centerVec
 * @param {number} width including border
 * @param {number} height including border
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 * @param {number | { tl: number
 *                  , tr: number
 *                  , br: number
 *                  , bl: number
 *                  }
 *        } [borderRadius = 0] in pixels
 */
export function centeredRoundedRect(
  centerVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth,
  borderRadius = 0
) {
  roundedRect(
    centerVec.sub(new Vector(width / 2, height / 2)),
    width,
    height,
    fillStyle,
    strokeStyle,
    lineWidth,
    borderRadius
  );
}

/**
 * Draw a normal rectangle, optionally with fill and border, with its top left
 * corner at the specified position
 * @param {Vector} topLeftVec top left, outside of border
 * @param {number} width including border
 * @param {number} height including border
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 */
export function rect(
  topLeftVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth
) {
  roundedRect(topLeftVec, width, height, fillStyle, strokeStyle, lineWidth, 0);
}

/**
 * Draw a normal, rounded rectangle, optionally with fill and border, with its
 * top left corner at the specified position
 * @param {Vector} topLeftVec top left, outside of border
 * @param {number} width including border
 * @param {number} height including border
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
 * @param {number} [lineWidth] leave undefined for no border
 * @param {number | { tl: number
 *                  , tr: number
 *                  , br: number
 *                  , bl: number
 *                  }
 *        } [borderRadius = 0] in pixels
 */
export function roundedRect(
  topLeftVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth,
  borderRadius = 0
) {
  const context = getContext();
  context.save();
  topLeftVec = topLeftVec.add(getCameraOffset());

  // If it is a rounded rectangle
  let rounded = true;

  /** @type {{tl: number, tr: number, br: number, bl: number}} */
  let corners;
  if (typeof borderRadius === "number") {
    if (borderRadius !== 0) {
      corners = {
        tl: borderRadius,
        tr: borderRadius,
        br: borderRadius,
        bl: borderRadius
      };
    } else {
      rounded = false;
    }
  } else {
    corners = borderRadius;
  }

  if (lineWidth === undefined) lineWidth = 0;
  // TODO do we really want to be adjusting by the line width?
  const x1 = topLeftVec.x + lineWidth / 2;
  const y1 = topLeftVec.y + lineWidth / 2;
  const x2 = topLeftVec.x + width - lineWidth / 2;
  const y2 = topLeftVec.y + height + lineWidth / 2;

  // the JavaScript canvas API doesn't have a built-in function for drawing
  // rounded rectangles, so we trace out the path manually
  context.beginPath();
  if (rounded) {
    context.moveTo(x1 + corners.tl, y1);
    context.lineTo(x2 - corners.tr, y1);
    context.quadraticCurveTo(x2, y1, x2, y1 + corners.tr);
    context.lineTo(x2, y2 - corners.br);
    context.quadraticCurveTo(x2, y2, x2 - corners.br, y2);
    context.lineTo(x1 + corners.bl, y2);
    context.quadraticCurveTo(x1, y2, x1, y2 - corners.bl);
    context.lineTo(x1, y1 + corners.tl);
    context.quadraticCurveTo(x1, y1, x1 + corners.tl, y1);
  } else {
    context.rect(topLeftVec.x, topLeftVec.y, width, height);
  }
  context.closePath();

  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  if (strokeStyle !== undefined && lineWidth !== undefined && lineWidth !== 0) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  // reset to original values
  context.restore();
}

/**
 * Draws a line between two positions
 * @param {Vector} pos1
 * @param {Vector} pos2
 * @param {string|CanvasGradient|CanvasPattern} strokeStyle
 * @param {number} lineWidth
 */
export function line(pos1, pos2, strokeStyle, lineWidth) {
  const context = getContext();
  context.save();
  pos1 = pos1.add(getCameraOffset());
  pos2 = pos2.add(getCameraOffset());
  context.beginPath();
  context.moveTo(pos1.x, pos1.y);
  context.lineTo(pos2.x, pos2.y);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.stroke();
  context.restore();
}

/**
 * draws the board
 * @param {number[][]} board
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @param {string} color
 */
export function drawBoard(board, blockWidth = 60, blockHeight = 60, color) {
  // TODO get rid of the need to pass in block width and height
  let context = getContext();
  context.save();

  // clear the canvas
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());

  // get the cells to draw based on position
  const cameraOffset = getCameraOffset();
  const topLeftCell = getCell(cameraOffset.mult(-1));
  const { width: screenWidth, height: screenHeight } = getScreenDimensions();
  const screenVec = new Vector(screenWidth, screenHeight);
  const bottomRightCell = getCell(
    getCameraOffset()
      .mult(-1)
      .add(screenVec)
  );

  const boardWidth = board.length;
  const boardHeight = board[0].length;

  // clamp all the corners to not over index the grid
  topLeftCell.x = clamp(topLeftCell.x, 0, boardWidth);
  topLeftCell.y = clamp(topLeftCell.y, 0, boardHeight);
  bottomRightCell.x = clamp(bottomRightCell.x + 1, 0, boardWidth);
  bottomRightCell.y = clamp(bottomRightCell.y + 1, 0, boardHeight);

  /**
   * draw underneath square of tile
   * @param {number} thickness extra width of underneath tile
   * @param {string|CanvasGradient|CanvasPattern} style
   * @param {Vector} cameraOffset
   */
  const drawBorder = (thickness, style, cameraOffset) => {
    context.fillStyle = style;
    for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
      for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
        if (board[i][j] >= 1) {
          // interact with context directly for efficiency
          context.fillRect(
            i * blockWidth - thickness + cameraOffset.x,
            j * blockHeight - thickness + cameraOffset.y,
            blockHeight + thickness * 2,
            blockHeight + thickness * 2
          );
        }
      }
    }
  };

  // draw squares underneath to create outline
  drawBorder(6, color, cameraOffset);
  drawBorder(2, "white", cameraOffset);

  // draw black squares on top
  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // TODO could be checking the block field instead of the terrain
      if (board[i][j] >= 1) {
        context.fillStyle =
          blockField[i][j].durability === Infinity ? "black" : "#202020";
        context.fillRect(
          i * blockWidth - overDraw + cameraOffset.x,
          j * blockHeight - overDraw + cameraOffset.y,
          blockWidth + overDraw * 2,
          blockHeight + overDraw * 2
        );
      }
    }
  }

  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // draw gems
      if (board[i][j] !== 0 && blockField[i][j].gemType !== undefined) {
        const diagonals = [
          [1, 1],
          [1, -1],
          [-1, -1],
          [-1, 1]
        ];
        const gemSpacing = 10;
        const gemSize = 10;
        const shineSize = 3;
        const gemMod = 1 + Math.cos(getTotalTime() / 300);
        let gemInfo = blockField[i][j].gemType;
        for (let k = 0; k < diagonals.length; k++) {
          const gemPosition = new Vector(
            (i + 0.5) * blockWidth + diagonals[k][0] * gemSpacing,
            (j + 0.5) * blockHeight + diagonals[k][1] * gemSpacing
          );
          const shinePosition = gemPosition.add(
            new Vector(-2 + 2 * gemMod, -2 + 2 * gemMod)
          );
          centeredRect(gemPosition, gemSize, gemSize, gemInfo.color);
          centeredRect(
            shinePosition,
            shineSize + gemMod * 0.7,
            shineSize + gemMod * 0.7,
            "white"
          );
        }
      }
    }
  }
  context.restore();
}

/**
 * @param {string} text
 * @param {Vector} centerVec
 * @param {string} [fontStyle] default "bold 50px sans-serif"
 * @param {CanvasTextAlign} [align] default "center"
 * @param {CanvasTextBaseline} [baseline] default "alphabetic"
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no outline
 * @param {number} [lineWidth]
 */
export function centeredText(
  text,
  centerVec,
  fontStyle = "bold 50px sans-serif",
  align = "center",
  baseline = "alphabetic",
  fillStyle,
  strokeStyle,
  lineWidth
) {
  const context = getContext();
  centerVec = centerVec.add(getCameraOffset());
  context.save();
  context.font = fontStyle;
  context.textAlign = align;
  context.textBaseline = baseline;
  if (fillStyle !== undefined) context.fillStyle = fillStyle;
  context.fillText(text, centerVec.x, centerVec.y);
  if (strokeStyle !== undefined && lineWidth !== undefined && lineWidth > 0) {
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.strokeText(text, centerVec.x, centerVec.y);
  }
  context.restore();
}

/**
 * @param {Vector} centerVec center position
 * @param {{
 *  angle: number,
 *  width: number,
 *  length: number,
 *  speed: number,
 *  hue: number
 * }[]} data shine data
 */
export function drawShines(centerVec, data) {
  centerVec = centerVec.add(getCameraOffset());
  const context = getContext();
  context.save();
  for (const d of data) {
    const left = new Vector(
      centerVec.x + d.length * Math.cos(d.angle - d.width),
      centerVec.y + d.length * Math.sin(d.angle - d.width)
    );
    const right = new Vector(
      centerVec.x + d.length * Math.cos(d.angle + d.width),
      centerVec.y + d.length * Math.sin(d.angle + d.width)
    );
    const grad = context.createRadialGradient(
      centerVec.x,
      centerVec.y,
      d.length / 2,
      centerVec.x,
      centerVec.y,
      d.length
    );
    grad.addColorStop(0, "hsla(" + d.hue + ", 100%, 50%, 1)");
    grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
    context.fillStyle = grad;
    context.beginPath();
    context.moveTo(centerVec.x, centerVec.y);
    context.lineTo(left.x, left.y);
    context.lineTo(right.x, right.y);
    context.closePath();
    context.fill();
  }
  context.restore();
}
