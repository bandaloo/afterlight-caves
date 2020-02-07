import { griderate, randomInt } from "../modules/helpers.js";
import { Vector } from "../modules/vector.js";
import { Block } from "./block.js";
import { createNumberGrid, dirs } from "./life.js";

const noisy = false;

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
 * returns the gem enum of the chosen gem
 * @returns {GemInfo}
 */
function pickGem() {
  // TODO make this more safe type-wise
  const normalitySum = Object.values(GemEnum)
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
        blockField[i].push(new Block(Math.random() > 0.75 ? 1 : Infinity, gem));
        // blockField[i].push(new Block(Infinity, gem));
      } else {
        // empty block
        blockField[i].push(undefined);
      }
    }
  }
  // Connect the different caves by editing the blockField array
  connectBoard(terrain, blockField);
}

/**
 * checks if a position is inside a board
 * @param {number} i
 * @param {number} j
 * @param {number[][]} board
 */
export function inboundsBoard(i, j, board) {
  return i >= 0 && i < board.length && j >= 0 && j < board[0].length;
}

/**
 * Returns a version of the trrain with each empty space segregated into non-connected numbered areas
 * @param {*} board
 * @returns {{segregatedBoard: number[][], groupNum: number, largestGroup: number}} segregatedTerrain
 */
export function segregateTerrain(board) {
  // init new 2d array to hold the cave markings
  let markedBoard = new Array(board.length);
  for (let i = 0; i < board.length; i++) {
    markedBoard[i] = new Array(board[i].length);
    for (let j = 0; j < board[i].length; j++) {
      markedBoard[i][j] = 0;
    }
  }
  // Flood fill each seperate area, and mark the area with a number.
  const width = board.length;
  const height = board[0].length;
  const isValid = ([x, y]) =>
    x < width &&
    x >= 0 &&
    y < height &&
    y >= 0 &&
    markedBoard[x][y] == 0 &&
    board[x][y] == 0;

  let markCounts = [0];
  let mark = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (isValid([i, j])) {
        mark++;
        markCounts[mark] = 0;
        const queue = [[i, j]];
        while (queue.length > 0) {
          const tile = queue.pop();
          const x = tile[0];
          const y = tile[1];
          markedBoard[x][y] = mark;
          markCounts[mark]++;
          if (isValid([x + 1, y])) queue.push([x + 1, y]);
          if (isValid([x, y + 1])) queue.push([x, y + 1]);
          if (isValid([x - 1, y])) queue.push([x - 1, y]);
          if (isValid([x, y - 1])) queue.push([x, y - 1]);
        }
      }
    }
  }
  if (noisy) {
    console.log("There were " + mark + " islands.");
  }
  let max = markCounts[0];
  let maxIndex = 0;
  for (let i = 1; i < markCounts.length; i++) {
    if (markCounts[i] > max) {
      maxIndex = i;
      max = markCounts[i];
    }
  }
  if (noisy) {
    console.log("The mainland is # " + maxIndex + ".");
    console.log("Marked map:");
    let string = "";
    for (let j = 0; j < board[0].length; j++) {
      for (let i = 0; i < board.length; i++) {
        string += markedBoard[i][j];
      }
      string += "\n";
    }
    if (noisy) {
      console.log(string);
    }
  }
  return {
    segregatedBoard: markedBoard,
    groupNum: mark,
    largestGroup: maxIndex
  };
}

/**
 * "connects" an arbitrary board by finding disconnected islands and connecting them.
 * @param {number[][]} board
 * @param {Block[][]} blockField
 */
export function connectBoard(board, blockField) {
  // let markedBoard = segregateTerrain(board);
  const {
    segregatedBoard: markedBoard,
    groupNum: mark,
    largestGroup: maxIndex
  } = segregateTerrain(board);
  // Only connect caves if there is more than 1 cave
  if (mark > 1) {
    // use the distanceBoard to find "edge" tiles
    let { board: boardDistance } = distanceBoard(board);
    let caveBoarders = [];
    for (let caveIndex = 1; caveIndex <= mark; caveIndex++) {
      caveBoarders[caveIndex] = [];
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (boardDistance[i][j] == 1 && markedBoard[i][j] == caveIndex) {
            caveBoarders[caveIndex].push(new Vector(i, j));
          }
        }
      }
    }
    // Create a connection for every cave
    for (let caveIndex = 1; caveIndex <= mark; caveIndex++) {
      // Don't connect the mainland to the mainland
      if (caveIndex != maxIndex) {
        let minimumDistance = Infinity;
        let minimumLine = [new Vector(0, 0), new Vector(0, 0)];
        for (let i = 0; i < caveBoarders[caveIndex].length; i++) {
          let p1 = caveBoarders[caveIndex][i];
          for (let j = 0; j < caveBoarders[maxIndex].length; j++) {
            let p2 = caveBoarders[maxIndex][j];
            let dist = p1.dist2(p2);
            if (dist < minimumDistance) {
              minimumDistance = dist;
              minimumLine = [new Vector(p1.x, p1.y), new Vector(p2.x, p2.y)];
            }
          }
        }

        // Create clay line in the x direction
        for (
          let i = minimumLine[0].x;
          i != minimumLine[1].x;
          i += minimumLine[0].x < minimumLine[1].x ? 1 : -1
        ) {
          if (blockField[i][minimumLine[1].y] != undefined) {
            blockField[i][minimumLine[1].y] = new Block(1, undefined);
          }
        }
        // Create clay line in the y direction
        for (
          let j = minimumLine[0].y;
          j != minimumLine[1].y;
          j += minimumLine[0].y < minimumLine[1].y ? 1 : -1
        ) {
          if (blockField[minimumLine[0].x][j] != undefined) {
            blockField[minimumLine[0].x][j] = new Block(1, undefined);
          }
        }
      }
    }
  }
}

/**
 * get a grid with numbers relating to closest block
 * @param {number[][]} board
 * @returns {{board: number[][], cells: Vector[][]}}
 */
export function distanceBoard(board) {
  const distCells = [];

  /**
   * push a new vector onto the cells array at correct index
   * @param {number} index
   * @param {Vector} vec
   */
  const addCell = (index, vec) => {
    if (distCells[index] === undefined) {
      distCells[index] = [];
    }
    distCells[index].push(vec);
  };

  let blocksCounted = 0;
  const totalBlocks = board.length * board[0].length;
  let distBoard = createNumberGrid(board.length, board[0].length, 0, -1);
  // make the distance board start with 0 for every block
  griderate(board, (board, i, j) => {
    if (board[i][j] >= 1) {
      distBoard[i][j] = 0;
      blocksCounted++;
    }
  });

  let curDist = 1;

  // grow out from the existing blocks
  while (blocksCounted < totalBlocks) {
    griderate(board, (board, i, j) => {
      for (let k = 0; k < dirs.length; k++) {
        if (distBoard[i][j] === curDist - 1) {
          const ni = i + dirs[k][0];
          const nj = j + dirs[k][1];
          if (inboundsBoard(ni, nj, board) && distBoard[ni][nj] === -1) {
            distBoard[ni][nj] = curDist;
            blocksCounted++;
            addCell(curDist, new Vector(ni, nj));
          }
        }
      }
    });
    curDist++;
  }

  return { board: distBoard, cells: distCells };
}
