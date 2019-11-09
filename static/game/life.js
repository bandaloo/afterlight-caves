import { mod } from "../modules/helpers.js";
import { RulesEnum } from "./rules.js";
import { EdgesEnum } from "./rules.js";
import { Vector } from "../modules/vector.js";

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
export function createNumberGrid(width, height, probability = 0) {
  // reset the board
  let board = [];
  // make the board a 2D array that is randomly filled
  for (let i = 0; i < width; i++) {
    board.push([]);
    for (let j = 0; j < height; j++) {
      let num = probability === 0 || Math.random() > probability ? 0 : 1;
      board[i].push(num);
    }
  }
  return board;
}

/**
 * counts the alive neighbors at a board position
 * @param {number[][]} board board to check for neighbors
 * @param {EdgesEnum} edges rule for edges of board
 * @param {number} i row of cell to count
 * @param {number} j column of cell to count
 */
function countNeighbors(board, edges, i, j) {
  let count = 0;
  let width = board.length;
  let height = board[0].length;
  // iterate through all 8 directions
  for (let k = 0; k < dirs.length; k++) {
    let x = i + dirs[k][0];
    let y = j + dirs[k][1];
    if (edges === EdgesEnum.wrap) {
      // modding ensures that numbers will wrap around
      x = mod(x, width);
      y = mod(y, height);
    }
    // checks if neighbor is outside (won't happen with wrap)
    if (x >= width || x < 0 || y >= height || y < 0) {
      // adds to count only if edge rule is alive
      count += edges === EdgesEnum.alive ? 1 : 0;
    } else {
      if (board[x][y] === 1) {
        count++;
      }
    }
  }
  return count;
}

/**
 * take a board and return a board iterated one step based on rules
 * @param {number[][]} board board to iterate
 * @param {RulesEnum[]} rules rules to iterate by
 * @param {EdgesEnum} edges rule for edges of board
 * @returns {number[][]}
 */
function stepBoard(board, rules, edges) {
  let width = board.length;
  let height = board[0].length;
  // make a clean board of same size to return
  let nextBoard = createNumberGrid(width, height);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let count = rules[countNeighbors(board, edges, i, j)];
      switch (count) {
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
  }
  return nextBoard;
}

/**
 * returns a board based on cellular automata rules
 * @param {number} width width of the board
 * @param {number} height height of the board
 * @param {RulesEnum[]} rules rules to determine birth and death
 * @param {EdgesEnum} edges rule for edges of board
 * @param {number} probability probability of board to fill randomly
 * @param {number} generations amount of generations to iterate
 * @returns {number[][]}
 */
export function getGrid(width, height, rules, edges, probability, generations) {
  let board = createNumberGrid(width, height, probability);
  for (let i = 0; i < generations; i++) {
    board = stepBoard(board, rules, edges);
  }
  return board;
}

/**
 * converts a board to human readable string representation
 * @param {number[][]} board
 */
export function boardToString(board) {
  let str = "";
  let width = board.length;
  let height = board[0].length;
  // iterate column-major so it prints out as on screen
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (board[i][j] >= 1) {
        str += "#";
      } else {
        str += "-";
      }
    }
    str += "\n";
  }
  return str;
}

/**
 * gets a list of vectors representing empty spaces from board
 * @param {number[][]} board
 * @param {number} num
 * @returns {Vector[]} empty spaces from the board
 */
export function getEmptySpaces(board, num, xScalar = 1, yScalar = xScalar) {
  /** @type {Vector[]} */
  let emptySpaces = [];
  let width = board.length;
  let height = board[0].length;
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (board[i][j] == 0) {
        emptySpaces.push(new Vector(i * xScalar, j * yScalar));
      }
    }
  }
  return emptySpaces;
}

// TODO have some sort of iterator for the board
