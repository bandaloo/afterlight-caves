import {
  getContext,
  getCanvasWidth,
  getCanvasHeight,
  getTotalTime
} from "../modules/gamemanager.js";
import { griderate } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { GemEnum } from "./generator.js";

/**
 * draw a centered rectangle with border at position
 * @param {Vector} centerVec
 * @param {number} width
 * @param {number} height
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} [borderColor]
 */
export function centeredOutlineRect(
  centerVec,
  width,
  height,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  let context = getContext();

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
 * draw a circle onto the draw canvas
 * @param {Vector} pos
 * @param {number} radius
 * @param {string} color
 */
export function drawCircle(pos, radius, color) {
  let context = getContext();
  context.beginPath();
  context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
}

/**
 *
 * @param {Vector} centerVec
 * @param {number} radius
 * @param {number} borderThickness
 * @param {string} centerColor
 * @param {string} borderColor
 */
export function outlineCircle(
  centerVec,
  radius,
  borderThickness,
  centerColor,
  borderColor = "black"
) {
  drawCircle(centerVec, radius + borderThickness, borderColor);
  drawCircle(centerVec, radius, centerColor);
}

/**
 * draws the board
 * @param {number[][]} board
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @param {string} color
 */
export function drawBoard(board, blockWidth = 60, blockHeight = 60, color) {
  let context = getContext();
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());

  // draw white squares underneath to create background
  griderate(board, (board, i, j) => {
    if (board[i][j] >= 1) {
      context.fillStyle = "white";
      context.fillRect(
        i * blockWidth - 5,
        j * blockHeight - 5,
        blockWidth + 10,
        blockHeight + 10
      );
    }
  });

  // draw colored squares on top
  griderate(board, (board, i, j) => {
    if (board[i][j] >= 1) {
      context.fillStyle = color;
      context.fillRect(
        i * blockWidth,
        j * blockHeight,
        blockWidth,
        blockHeight
      );
    }
  });

  // draw semitransparent square in center
  griderate(board, (board, i, j) => {
    if (board[i][j] >= 1) {
      context.fillStyle = "#ffffff77";
      context.fillRect(
        i * blockWidth + 10,
        j * blockHeight + 10,
        blockWidth - 20,
        blockHeight - 20
      );
    }

    // draw gems
    if (board[i][j] > 1) {
      const diagonals = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
      const gemSpacing = 10;
      const gemSize = 10;
      const shineSize = 3;
      //const gemMod = 1 + Math.cos(getTotalTime() / 300);
      const gemMod = 0;
      let gemColor = GemEnum[board[i][j]].color;
      console.log(gemMod);
      for (let k = 0; k < diagonals.length; k++) {
        const gemPosition = new Vector(
          (i + 0.5) * blockWidth + diagonals[k][0] * gemSpacing,
          (j + 0.5) * blockHeight + diagonals[k][1] * gemSpacing
        );
        const shinePosition = gemPosition.add(
          new Vector(-2 + 2 * gemMod, -2 + 2 * gemMod)
        );
        centeredOutlineRect(gemPosition, gemSize, gemSize, 3, gemColor);
        centeredOutlineRect(
          shinePosition,
          shineSize + gemMod * 0.7,
          shineSize + gemMod * 0.7,
          1,
          "white",
          "white"
        );
      }
    }
  });
}
