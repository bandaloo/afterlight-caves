import { Vector } from "./vector.js";
import { Entity } from "./entity.js";
import { getTerrain, getDimensions } from "./gamemanager.js";

// TODO make this better and more robust someday and put it in the engine

/**
 * @typedef {Object} Box
 * @property {number} x,
 * @property {number} y,
 * @property {number} width,
 * @property {number} height
 */

/**
 * @param {Vector} pos
 * @param {number} blockWidth
 * @param {number} blockHeight
 * @returns {Vector}
 */
export function getCell(pos, blockWidth, blockHeight) {
  const i = Math.floor(pos.x / blockWidth);
  const j = Math.floor(pos.y / blockHeight);
  return new Vector(i, j);
}

// TODO make this not need to get block width and height

/**
 * @param {Vector} pos
 * @param {number} blockWidth
 * @param {number} blockHeight
 */
export function distanceToCell(pos, blockWidth, blockHeight) {
  const cell = getCell(pos, blockWidth, blockHeight);
  const topWall = blockHeight * cell.y;
  const bottomWall = blockHeight * (cell.y + 1);
  const leftWall = blockWidth * cell.x;
  const rightWall = blockHeight * (cell.x + 1);

  return {
    top: pos.y - topWall,
    bottom: bottomWall - pos.y,
    left: pos.x - leftWall,
    right: rightWall - pos.x,
    topWall: topWall,
    bottomWall: bottomWall,
    leftWall: leftWall,
    rightWall: rightWall
  };
}

/**
if(player1.x < player2.x + player2.width &&
  player1.x + player1.width > player2.x &&
  player1.y < player2.y + player2.height &&
  player1.y + player1.height > player2.y)
{
*/

/**
 * checks to see if two boxes are colliding
 * @param {Box} box1
 * @param {Box} box2
 */
function aabbCheck(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

/**
 * return a box that is the second box adjusted against first box
 * @param {Box} box1;
 * @param {Box} box2;
 */
function aabbResolve(box1, box2) {}

/**
 * move the entity based on solidity of world
 * @param {Entity} entity
 */
export function adjustEntity(entity) {
  const block = getDimensions();
  const distances = distanceToCell(entity.pos, block.width, block.height);
  const cell = getCell(entity.pos, block.width, block.height);
  // check bottom
  if (solidAt(cell.x, cell.y + 1) && distances.bottom < entity.height / 2) {
    entity.pos.y = distances.bottomWall - entity.height / 2;
    entity.vel.y *= -entity.bounciness;
  }
  // check top
  if (solidAt(cell.x, cell.y - 1) && distances.top < entity.height / 2) {
    entity.pos.y = distances.topWall + entity.height / 2;
    entity.vel.y *= -entity.bounciness;
  }
  // check left
  if (solidAt(cell.x - 1, cell.y) && distances.left < entity.width / 2) {
    entity.pos.x = distances.leftWall + entity.width / 2;
    entity.vel.x *= -entity.bounciness;
  }
  // check right
  if (solidAt(cell.x + 1, cell.y) && distances.right < entity.width / 2) {
    entity.pos.x = distances.rightWall - entity.width / 2;
    entity.vel.x *= -entity.bounciness;
  }
}

/**
 * checks if cell position solid (outside is solid)
 * @param {number} i
 * @param {number} j
 * @returns {boolean}
 */
export function solidAt(i, j) {
  const board = getTerrain();
  return (
    i < 0 ||
    i >= board.length ||
    j < 0 ||
    j >= board[0].length ||
    board[i][j] !== 0
  );
}
