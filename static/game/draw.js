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

// TODO some of these are more generic drawing functions that could be moved to
// the engine

/**
 * draw a centered rectangle with border at position
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} [borderColor]
 */
export function centeredOutlineRectFill(
  centerVec,
  width,
  height,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  let context = getContext();

  centerVec = centerVec.add(getCameraOffset());

  // draw the outline rect
  context.fillStyle = borderColor;
  context.fillRect(
    centerVec.x - width / 2 - borderThickness,
    centerVec.y - height / 2 - borderThickness,
    width + borderThickness * 2,
    height + borderThickness * 2
  );

  // draw the center rect
  context.fillStyle = centerColor;
  context.fillRect(
    centerVec.x - width / 2,
    centerVec.y - height / 2,
    width,
    height
  );
}

/**
 * draw a centered, rounded rectangle with border at position
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle] leave undefined for
 * no fill
 * @param {string|CanvasGradient|CanvasPattern} [borderStyle] leave undefined
 * for no border
 * @param {number} [borderThickness] leave undefined for no border
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
  borderStyle,
  borderThickness,
  borderRadius = 0
) {
  const context = getContext();
  context.save();
  centerVec = centerVec.add(getCameraOffset());

  /** @type {{tl: number, tr: number, br: number, bl: number}} */
  let corners;
  if (typeof borderRadius === "number") {
    corners = {
      tl: borderRadius,
      tr: borderRadius,
      br: borderRadius,
      bl: borderRadius
    };
  } else {
    corners = borderRadius;
  }

  const x = centerVec.x - width / 2;
  const y = centerVec.y - height / 2;

  // the JavaScript canvas API doesn't have a built-in function for drawing
  // rounded rectangles, so we trace out the path manually
  context.beginPath();
  context.moveTo(x + corners.tl, y);
  context.lineTo(x + width - corners.tr, y);
  context.quadraticCurveTo(x + width, y, x + width, y + corners.tr);
  context.lineTo(x + width, y + height - corners.br);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - corners.br,
    y + height
  );
  context.lineTo(x + corners.bl, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - corners.bl);
  context.lineTo(x, y + corners.tl);
  context.quadraticCurveTo(x, y, x + corners.tl, y);
  context.closePath();
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  if (borderStyle !== undefined && borderThickness !== undefined) {
    context.strokeStyle = borderStyle;
    context.lineWidth = borderThickness;
    context.stroke();
  }

  // reset to original values
  context.restore();
}

/**
 *
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {number} strokeWidth
 * @param {string} strokeStyle usually this will just be a color string
 * @param {string} [fillStyle]
 */
export function centeredOutlineRect(
  centerVec,
  width,
  height,
  strokeWidth,
  strokeStyle,
  fillStyle
) {
  centerVec = centerVec.add(getCameraOffset());
  const context = getContext();
  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeStyle;
  context.rect(
    centerVec.x - width / 2,
    centerVec.y - height / 2,
    width,
    height
  );
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
}

/**
 * draws a normal rectangle from the corner
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} style
 */
export function normalRect(x, y, width, height, style) {
  x += getCameraOffset().x;
  y += getCameraOffset().y;
  // TODO technically kind of redundant to keep resetting style when drawing
  // the game board
  const context = getContext();
  context.fillStyle = style;
  context.fillRect(x, y, width, height);
}

// TODO get rid of the following function
/**
 * draw a circle onto the draw canvas
 * @param {Vector} pos
 * @param {number} radius
 * @param {string} color
 */
export function drawCircle(pos, radius, color) {
  const context = getContext();
  context.beginPath();
  context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
}

// TODO get rid of this

/**
 * draw outline circle
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} borderColor
 */
export function outlineCircleFill(
  centerVec,
  radius,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  drawCircle(centerVec, radius + borderThickness, borderColor);
  drawCircle(centerVec, radius, centerColor);
}

// TODO could just make this call centeredOutlineEllipse
/**
 * draw centered outline circle
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {number} strokeWidth
 * @param {string} strokeStyle
 * @param {string} [fillStyle]
 */
export function centeredOutlineCircle(
  centerVec,
  radius,
  strokeWidth,
  strokeStyle,
  fillStyle
) {
  const context = getContext();

  centerVec = centerVec.add(getCameraOffset());

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeStyle;
  context.arc(centerVec.x, centerVec.y, radius, 0, 2 * Math.PI);
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
}

/**
 * draw centered outline ellipse
 * @param {Vector} centerVec
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {number} strokeWidth
 * @param {string} strokeStyle
 * @param {string} [fillStyle]
 */
export function centeredOutlineEllipse(
  centerVec,
  radiusX,
  radiusY,
  strokeWidth,
  strokeStyle,
  fillStyle
) {
  const context = getContext();

  centerVec = centerVec.add(getCameraOffset());

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeStyle;
  context.ellipse(
    centerVec.x,
    centerVec.y,
    radiusX,
    radiusY,
    0,
    0,
    2 * Math.PI
  );
  if (fillStyle !== undefined) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
}

/**
 * draw a line
 * @param {Vector} pos1
 * @param {Vector} pos2
 * @param {string} style
 * @param {number} width
 */
export function drawLine(pos1, pos2, style, width) {
  const context = getContext();

  pos1 = pos1.add(getCameraOffset());
  pos2 = pos2.add(getCameraOffset());

  context.beginPath();
  context.strokeStyle = style;
  context.lineWidth = width;
  context.moveTo(pos1.x, pos1.y);
  context.lineTo(pos2.x, pos2.y);
  context.stroke();
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
  // clear the canvas
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());

  // get the cells to draw based on position
  const topLeftCell = getCell(getCameraOffset().mult(-1));
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
   * @param {string} style
   */
  const drawBorder = (thickness, style) => {
    for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
      for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
        if (board[i][j] >= 1) {
          normalRect(
            i * blockWidth - thickness,
            j * blockHeight - thickness,
            blockWidth + thickness * 2,
            blockHeight + thickness * 2,
            style
          );
        }
      }
    }
  };

  // draw squares underneath to create outline
  drawBorder(6, color);
  drawBorder(2, "white");

  // draw black squares on top
  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // TODO could be checking the block field instead of the terrain
      if (board[i][j] >= 1) {
        normalRect(
          i * blockWidth - overDraw,
          j * blockHeight - overDraw,
          blockWidth + overDraw * 2,
          blockHeight + overDraw * 2,
          blockField[i][j].durability === Infinity ? "black" : "#202020"
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
          centeredOutlineRectFill(
            gemPosition,
            gemSize,
            gemSize,
            0,
            gemInfo.color
          );
          centeredOutlineRectFill(
            shinePosition,
            shineSize + gemMod * 0.7,
            shineSize + gemMod * 0.7,
            1,
            "white",
            "white"
          );
        }
      }
    }
  }
}

/**
 * @param {string} text
 * @param {Vector} centerVec
 * @param {string} fillStyle
 * @param {string | CanvasGradient} [strokeStyle] default "black"
 * @param {string} [fontStyle] default "bold 50px sans-serif"
 * @param {CanvasTextAlign} [align] default "center"
 * @param {CanvasTextBaseline} [baseline]
 * @param {number} [lineWidth] default 4
 */
export function centeredText(
  text,
  centerVec,
  fillStyle,
  strokeStyle = "black",
  fontStyle = "bold 50px sans-serif",
  align = "center",
  baseline = "alphabetic",
  lineWidth = 4
) {
  const context = getContext();
  centerVec = centerVec.add(getCameraOffset());
  context.save();
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.fillStyle = fillStyle;
  context.font = fontStyle;
  context.textAlign = align;
  context.textBaseline = baseline;
  context.fillText(text, centerVec.x, centerVec.y);
  context.strokeText(text, centerVec.x, centerVec.y);
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
 * }[]} data each shine has
 * an angle in radians and a width in radians
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
