import { getCell } from "../modules/collision.js";
import { getTotalTime, SPLATTER_SCALAR } from "../modules/gamemanager.js";
import { clamp, hsl, randomNormalVec } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { blockField } from "./generator.js";
import {
  getSplatterContext,
  getContext,
  getScreenDimensions,
  getCameraOffset
} from "../modules/displaymanager.js";

// this is to get rid of weird lines when moving the camera
const overDraw = 0.5;

/**
 * gets the appropriate drawing context
 * @param {boolean} [splatter] leave undefined to just get the draw context
 */
export function getDrawContext(splatter = false) {
  return !splatter ? getContext() : getSplatterContext();
}

/**
 * adjusts the drawing vector based on camera and context
 * @param {boolean} splatter
 * @param {Vector} vec
 * @param {number} width
 * @param {number} height
 * @return {{width: number, height: number, vec: Vector}}
 */
export function adjustDrawVec(splatter, vec, width, height) {
  const adjustments = { width: width, height: height, vec: undefined };
  if (splatter) {
    adjustments.width /= SPLATTER_SCALAR;
    adjustments.height /= SPLATTER_SCALAR;
    adjustments.vec = vec.mult(1 / SPLATTER_SCALAR);
  } else {
    adjustments.vec = vec.add(getCameraOffset());
  }
  return adjustments;
}

/**
 * draws a polygon with wiggling sides
 * @param {Vector} centerVec
 * @param {number} sides
 * @param {number} width
 * @param {number} height
 * @param {number} offset
 * @param {string|CanvasGradient|CanvasPattern} [fillStyle]
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle]
 * @param {(arg0: number) => number} func offsets vertices based on angle
 */
export function polygon(
  centerVec,
  sides,
  width,
  height,
  offset,
  fillStyle = "rgba(0, 0, 0, 0)",
  strokeStyle = "red",
  lineWidth = 5,
  func = () => 1
) {
  width /= 2;
  height /= 2;
  centerVec = centerVec.add(getCameraOffset());
  const context = getContext();
  context.save();
  context.beginPath();
  context.fillStyle = fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  let funcOffset = func(offset);
  context.moveTo(
    centerVec.x + funcOffset * width * Math.cos(offset),
    centerVec.y + funcOffset * height * Math.sin(offset)
  );
  for (let i = 1; i < sides; i++) {
    const angle = offset + (i / sides) * Math.PI * 2;
    funcOffset = func(angle);
    context.lineTo(
      centerVec.x + funcOffset * width * Math.cos(angle),
      centerVec.y + funcOffset * height * Math.sin(angle)
    );
  }
  context.closePath();
  context.fill();
  context.stroke();
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
 * @param {boolean} [splatter] leave undefined for regular drawing
 */
export function ellipse(
  centerVec,
  radiusX,
  radiusY,
  fillStyle,
  lineWidth,
  strokeStyle,
  splatter = false
) {
  const context = getDrawContext(splatter);
  ({ vec: centerVec, width: radiusX, height: radiusY } = adjustDrawVec(
    splatter,
    centerVec,
    radiusX,
    radiusY
  ));
  context.save();
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
 * @param {number} [lineWidth] leave undefined for no border
 * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
 * for no border
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
 * @param {boolean} [splatter]
 */
export function centeredRect(
  centerVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth,
  splatter = false
) {
  centeredRoundedRect(
    centerVec,
    width,
    height,
    fillStyle,
    strokeStyle,
    lineWidth,
    0,
    splatter
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
 * @param {boolean} [splatter]
 */
export function centeredRoundedRect(
  centerVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth,
  borderRadius = 0,
  splatter = false
) {
  roundedRect(
    centerVec.sub(new Vector(width / 2, height / 2)),
    width,
    height,
    fillStyle,
    strokeStyle,
    lineWidth,
    borderRadius,
    splatter
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
  roundedRect(
    topLeftVec,
    width,
    height,
    fillStyle,
    strokeStyle,
    lineWidth,
    0,
    false
  );
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
 * @param {boolean} splatter
 */
export function roundedRect(
  topLeftVec,
  width,
  height,
  fillStyle,
  strokeStyle,
  lineWidth,
  borderRadius = 0,
  splatter = false
) {
  const context = getDrawContext(splatter);
  context.save();
  //topLeftVec = topLeftVec.add(getCameraOffset());
  ({ vec: topLeftVec, width: width, height: height } = adjustDrawVec(
    splatter,
    topLeftVec,
    width,
    height
  ));

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
  const x1 = topLeftVec.x + lineWidth / 2;
  const y1 = topLeftVec.y + lineWidth / 2;
  const x2 = topLeftVec.x + width - lineWidth / 2;
  const y2 = topLeftVec.y + height - lineWidth / 2;

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
  const context = getDrawContext();
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
 * Draws a cubic bezier curve based on 4 points
 * @param {Vector} pos1
 * @param {Vector} pos2
 * @param {Vector} pos3
 * @param {Vector} pos4
 * @param {string|CanvasGradient|CanvasPattern} strokeStyle
 * @param {number} lineWidth
 */
export function bezierCurve(pos1, pos2, pos3, pos4, strokeStyle, lineWidth) {
  const context = getDrawContext();
  context.save();

  pos1 = pos1.add(getCameraOffset());
  pos2 = pos2.add(getCameraOffset());
  pos3 = pos3.add(getCameraOffset());
  pos4 = pos4.add(getCameraOffset());

  context.beginPath();
  context.moveTo(pos1.x, pos1.y);
  context.bezierCurveTo(pos2.x, pos2.y, pos3.x, pos3.y, pos4.x, pos4.y);
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
 * @param {number} hue
 */
export function drawBoard(board, blockWidth = 60, blockHeight = 60, hue) {
  // TODO get rid of the need to pass in block width and height
  let context = getDrawContext();
  context.save();

  /**
   * draws a centered rectangle without changing style or saving and resetting
   * the context (used to optimize drawing the gems)
   * @param {Vector} centerVec
   * @param {number} width
   * @param {number} height
   */
  const simpleCenteredRect = (centerVec, width, height) => {
    const cornerVec = centerVec.add(getCameraOffset());
    context.fillRect(
      cornerVec.x - width / 2,
      cornerVec.y - height / 2,
      width,
      height
    );
  };

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

  // draw the world border
  const worldBorderWidth = 6;
  // this conditional is a pretty minor optimization
  if (
    topLeftCell.x === 0 ||
    topLeftCell.y == 0 ||
    bottomRightCell.x === boardWidth ||
    bottomRightCell.y === boardHeight
  ) {
    rect(
      new Vector(-worldBorderWidth / 2, -worldBorderWidth / 2),
      blockWidth * boardWidth + worldBorderWidth,
      blockHeight * boardHeight + worldBorderWidth,
      undefined,
      hsl(hue, 100, 50),
      worldBorderWidth
    );
  }

  /**
   * draw underneath square of tile
   * @param {number} thickness extra width of underneath tile
   * @param {number} hue
   * @param {Vector} cameraOffset
   */
  const drawBorder = (thickness, hue, cameraOffset) => {
    context.fillStyle = hsl(hue);
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
  drawBorder(worldBorderWidth, hue, cameraOffset);

  // draw light gray squares on top
  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      context.fillStyle = hsl(hue, 50, 5);
      if (board[i][j] >= 1) {
        context.fillRect(
          i * blockWidth - overDraw + cameraOffset.x,
          j * blockHeight - overDraw + cameraOffset.y,
          blockWidth + overDraw * 2,
          blockHeight + overDraw * 2
        );
      }
    }
  }

  // loop again through for the destructable blocks to avoid context switching
  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      context.fillStyle = "#333333";
      if (board[i][j] >= 1) {
        if (blockField[i][j].durability !== Infinity) {
          context.fillRect(
            i * blockWidth + overDraw + cameraOffset.x,
            j * blockHeight + overDraw + cameraOffset.y,
            blockWidth - overDraw * 2,
            blockHeight - overDraw * 2
          );
        }
      }
    }
  }

  for (let i = topLeftCell.x; i < bottomRightCell.x; i++) {
    for (let j = topLeftCell.y; j < bottomRightCell.y; j++) {
      // draw gems
      const gemMod = 1 + Math.cos(getTotalTime() / 300);
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
        let gemInfo = blockField[i][j].gemType;

        /**
         * @param {number} k
         */
        const calcGemPosition = k =>
          new Vector(
            (i + 0.5) * blockWidth + diagonals[k][0] * gemSpacing,
            (j + 0.5) * blockHeight + diagonals[k][1] * gemSpacing
          );

        context.fillStyle = gemInfo.color;
        for (let k = 0; k < diagonals.length; k++) {
          const gemPosition = calcGemPosition(k);
          simpleCenteredRect(gemPosition, gemSize, gemSize);
        }
        context.fillStyle = "white";
        for (let k = 0; k < diagonals.length; k++) {
          const gemPosition = calcGemPosition(k);
          const shinePosition = gemPosition.add(
            new Vector(-2 + 2 * gemMod, -2 + 2 * gemMod)
          );
          simpleCenteredRect(
            shinePosition,
            shineSize + gemMod * 0.7,
            shineSize + gemMod * 0.7
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
 * @param {string} [fontStyle] default "bold 50px anonymous"
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
  fontStyle = "bold 50px anonymous",
  align = "center",
  baseline = "alphabetic",
  fillStyle,
  strokeStyle,
  lineWidth
) {
  const context = getDrawContext();
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
    angle: number;
    width: number;
    length: number;
    speed: number;
}[]} data shine data
 * @param {string} gradColor
 */
export function drawShines(centerVec, data, gradColor) {
  centerVec = centerVec.add(getCameraOffset());
  const context = getDrawContext();
  const grad = context.createRadialGradient(
    centerVec.x,
    centerVec.y,
    0,
    centerVec.x,
    centerVec.y,
    60
  );

  grad.addColorStop(0, gradColor);
  grad.addColorStop(1, "#00000000");
  context.save();
  context.fillStyle = grad;
  for (const d of data) {
    const left = new Vector(
      centerVec.x + d.length * Math.cos(d.angle - d.width),
      centerVec.y + d.length * Math.sin(d.angle - d.width)
    );
    const right = new Vector(
      centerVec.x + d.length * Math.cos(d.angle + d.width),
      centerVec.y + d.length * Math.sin(d.angle + d.width)
    );
    context.beginPath();
    context.moveTo(centerVec.x, centerVec.y);
    context.lineTo(left.x, left.y);
    context.lineTo(right.x, right.y);
    context.closePath();
    context.fill();
  }
  context.restore();
}

/**
 * function to draw splatter on the splatter canvas
 * @param {Vector} centerVec
 * @param {string|CanvasGradient|CanvasPattern} style
 * @param {number} size
 * @param {"round" | "rectangular"} shape
 * @param {Vector} [vel] don't define for no velocity
 * @param {{ splats: number
 *         , offsetScalar: number
 *         , velocityScalar: number
 *         , sizeScalar: number
 *         }} [options] change the look of the splat (leave undefined for default)
 */
export function splatter(
  centerVec,
  style,
  size,
  shape,
  vel = new Vector(0, 0),
  options = { splats: 10, offsetScalar: 2, velocityScalar: 15, sizeScalar: 0.6 }
) {
  const { splats, offsetScalar, velocityScalar, sizeScalar } = options;
  for (let i = 0; i < splats; i++) {
    const sizeMod = ((i + 1) / (splats + 1)) * sizeScalar;
    const offsetVec = randomNormalVec()
      .mult(Math.random() * size * offsetScalar * (1 - sizeMod))
      .add(vel.mult(Math.random() * velocityScalar));
    if (shape === "round") {
      ellipse(
        centerVec.add(offsetVec),
        size * sizeMod * 2,
        size * sizeMod * 2,
        style,
        undefined,
        undefined,
        true
      );
    } else if (shape === "rectangular") {
      centeredRect(
        centerVec.add(offsetVec),
        size * sizeMod,
        size * sizeMod,
        style,
        undefined,
        undefined,
        true
      );
    }
  }
}
