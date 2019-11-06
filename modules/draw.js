import {
  getCanvas,
  getContext,
  getCanvasWidth,
  getCanvasHeight
} from "./gamemanager.js";

export function drawBoard(board, blockWidth = 60, blockHeight = 60) {
  let width = board.length;
  let height = board[0].length;
  let canvas = getCanvas();
  let context = getContext();
  context.fillStyle = "red";
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());
  context.fillStyle = "black";
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (board[i][j] === 0) {
        context.fillRect(
          i * blockWidth,
          j * blockHeight,
          blockWidth,
          blockHeight
        );
      }
    }
  }
}
