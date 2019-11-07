import {
  getCanvas,
  getContext,
  getCanvasWidth,
  getCanvasHeight
} from "../modules/gamemanager.js";

export function drawBoard(board, blockWidth = 60, blockHeight = 60, color) {
  let width = board.length;
  let height = board[0].length;
  let context = getContext();
  context.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (board[i][j] === 1) {
        context.fillStyle = "white";
        context.fillRect(
          i * blockWidth - 5,
          j * blockHeight - 5,
          blockWidth + 10,
          blockHeight + 10
        );
      }
    }
  }
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (board[i][j] === 1) {
        context.fillStyle = color;
        context.fillRect(
          i * blockWidth,
          j * blockHeight,
          blockWidth,
          blockHeight
        );
      }
    }
  }
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (board[i][j] === 1) {
        context.fillStyle = "#ffffff77";
        context.fillRect(
          i * blockWidth + 10,
          j * blockHeight + 10,
          blockWidth - 20,
          blockHeight - 20
        );
      }
    }
  }
}
