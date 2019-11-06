import { mod } from "./helpers.js";

const RulesEnum = Object.freeze({ die: 1, stay: 2, both: 3, birth: 4 });

const EdgeEnum = Object.freeze({ wrap: 1, alive: 2, dead: 3 });

/** @type {number[]} */
export const caveRules = [
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.stay,
  RulesEnum.both,
  RulesEnum.both,
  RulesEnum.both,
  RulesEnum.both
];

/** @type {number[]} */
export const conwayRules = [
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.stay,
  RulesEnum.both,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die,
  RulesEnum.die
];

const dirs = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1]
];

/**
 * @param {number} width width to resize board
 * @param {number} height height to resize board
 * @returns {number[][]}
 */
function createNumberGrid(width, height, probability = 0) {
  // reset the board
  let board = [];
  // make the board a 2D array that is randomly filled
  for (let i = 0; i < width; i++) {
    board.push([]);
    let num = probability === 0 || Math.random() > probability ? 0 : 1;
    for (let j = 0; j < height; j++) {
      board[i].push(num);
    }
  }
  return board;
}

function countNeighbors(board, i, j) {
  let count = 0;
  let width = board.length;
  let height = board[0].length;
  for (let k = 0; k < dirs.length; k++) {
    // modding ensures that numbers will wrap around
    let x = mod(i + dirs[k][0], width);
    let y = mod(j + dirs[k][1], height);
    if (board[x][y] == 1) {
      count++;
    }
  }
  return count;
}

/**
 * Take a board and return a board iterated one step based on rules
 * @param {number[][]} board board to iterate
 * @param {number[]} rules rules to iterate by
 * @returns {number[][]}
 */
function stepBoard(board, rules) {
  let width = board.length;
  let height = board[0].length;
  let nextBoard = createNumberGrid(width, height, 0);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      switch (rules[countNeighbors(i, j)]) {
        case RulesEnum.stay:
          nextBoard[i][j] = board[i][j];
          break;
        case RulesEnum.both:
          nextBoard[i][j] = 1;
          break;
        case RulesEnum.birth:
          if (board[i][j] == 0) {
            nextBoard[i][j] = 1;
          }
          break;
        case RulesEnum.die:
          // do nothing since board already has a 0 in it
          break;
        default:
          throw new Error("unrecognized rule");
      }
    }
    return nextBoard;
  }
}

/**
 *
 * @param {number} width width of the board
 * @param {number} height height of the board
 * @param {number} rules rules to determine birth and death
 * @param {*} probability probability of board to fill randomly
 * @param {*} generations amount of generations to iterate
 * @returns {number[][]}
 */
export function getGrid(width, height, rules, probability, generations) {}
