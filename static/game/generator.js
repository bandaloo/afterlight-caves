import { randomInt, griderate } from "../modules/helpers.js";
import { createNumberGrid } from "./life.js";

/**
 * @typedef {Object} GemInfo
 * @property {string} name
 * @property {string} color
 * @property {number} normality
 */

/**
 * maps gem number to gem info
 * @type {Object.<number, GemInfo>}
 */
export const GemEnum = Object.freeze({
  2: { name: "gold", color: "#ffea00", normality: 10 },
  3: { name: "emerald", color: "#11e00d", normality: 5 },
  4: { name: "ruby", color: "#ff2600", normality: 3 },
  5: { name: "diamond", color: "#60f7fc", normality: 1 }
});

/**
 * returns the random number to associate to board
 * @param {number[][]} board
 * @returns {number}
 */
function pickGem(board) {
  // TODO make this more safe type-wise
  const normalitySum = Object.values(GemEnum)
    .map(o => o.normality)
    .reduce((a, b) => a + b);
  const choice = randomInt(normalitySum);
  const entries = Object.entries(GemEnum);
  let sum = 0;
  for (const entry of entries) {
    if (choice < entry[1].normality + sum) {
      return parseInt(entry[0]);
    }
    sum += entry[1].normality;
  }
}

/**
 * returns a board with gems sprinkled throughout
 * @param {number[][]} board
 * @param {number} chance
 * @returns {number[][]}
 */
export function pepperGems(board, chance) {
  const gemmedBoard = createNumberGrid(board.length, board[0].length);
  griderate(board, (board, i, j) => {
    if (board[i][j] !== 0 && Math.random() < chance) {
      gemmedBoard[i][j] = pickGem(board);
    } else {
      gemmedBoard[i][j] = board[i][j];
    }
  });
  return gemmedBoard;
}
