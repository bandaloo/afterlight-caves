import {
  getContext,
  getCanvasWidth,
  getCanvasHeight
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
function centeredOutlineRect(
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
    centerVec.x - (width + borderThickness) / 2,
    centerVec.y - (height + borderThickness) / 2,
    width + borderThickness,
    height + borderThickness
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

    // TODO move this somewhere else
    if (board[i][j] > 1) {
      let gemColor = GemEnum[board[i][j]].color;
      centeredOutlineRect(
        new Vector((i + 0.5) * blockWidth, (j + 0.5) * blockHeight),
        20,
        20,
        3,
        gemColor
      );
    }
  });
}
