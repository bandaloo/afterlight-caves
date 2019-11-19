import { randomInt, griderate } from "../modules/helpers.js";
import { createNumberGrid } from "./life.js";
import { Block } from "./block.js";

/**
 * @typedef {Object} GemInfo
 * @property {string} name
 * @property {string} color
 * @property {number} normality
 */

/**
 * maps gem number to gem info
 * @enum {Object<number, GemInfo>}
 */
export const GemNumberEnum = Object.freeze({
  2: { name: "gold", color: "#ffea00", normality: 10 },
  3: { name: "emerald", color: "#11e00d", normality: 5 },
  4: { name: "ruby", color: "#ff2600", normality: 3 },
  5: { name: "diamond", color: "#60f7fc", normality: 1 }
});

/**
 * maps gem string to gem info
 * @enum {Object<string, GemInfo>}
 */
export const GemEnum = Object.freeze({
  gold: { color: "#ffea00", normality: 10 },
  emerald: { color: "#11e00d", normality: 5 },
  ruby: { color: "#ff2600", normality: 3 },
  diamond: { color: "#60f7fc", normality: 1 }
});

/**
 * maps a string to a number for types of generation
 * @enum{Object<string, number>}
 */
export const RoomTypeEnum = Object.freeze({ cave: 1 });

/**
 * similar to the terrain in the game manager but more info
 * @type {Block[][]}
 */
export let blockField = [];

/**
 * returns the random number to associate to board
 * @returns {number}
 */
function oldPickGem() {
  // TODO make this more safe type-wise
  const normalitySum = Object.values(GemNumberEnum)
    .map(o => o.normality)
    .reduce((a, b) => a + b);
  const choice = randomInt(normalitySum);
  const entries = Object.entries(GemNumberEnum);
  let sum = 0;
  for (const entry of entries) {
    if (choice < entry[1].normality + sum) {
      return parseInt(entry[0]);
    }
    sum += entry[1].normality;
  }
}

/**
 * returns the gem enum of the chosen gem
 * @returns {GemEnum}
 */
function pickGem() {
  // TODO make this more safe type-wise
  const normalitySum = Object.values(GemNumberEnum)
    .map(o => o.normality)
    .reduce((a, b) => a + b);
  const choice = randomInt(normalitySum);
  const entries = Object.entries(GemEnum);
  let sum = 0;
  for (const entry of entries) {
    if (choice < entry[1].normality + sum) {
      return GemEnum[entry[0]];
    }
    sum += entry[1].normality;
  }
}

// TODO move pepper gems to act on the block field, not terrain

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
      gemmedBoard[i][j] = oldPickGem();
    } else {
      gemmedBoard[i][j] = board[i][j];
    }
  });
  return gemmedBoard;
}

/**
 * create block field from grid of numbers
 * @param {number[][]} terrain
 */
export function initBlockField(terrain) {
  blockField = [];
  for (let i = 0; i < terrain.length; i++) {
    blockField.push([]);
    for (let j = 0; j < terrain[0].length; j++) {
      if (terrain[i][j] !== 0) {
        // solid block
        const gem = Math.random() < 0.1 ? pickGem() : undefined;
        blockField[i].push(new Block(Math.random() > 0.5 ? 1 : Infinity, gem));
      } else {
        // empty block
        blockField[i].push(undefined);
      }
    }
  }
  console.log(blockField);
}
