import { Entity } from "./entity.js";
import { getDimensions, getTerrain } from "./gamemanager.js";
import { Vector } from "./vector.js";

/**
 * @param {Vector} pos
 * @returns {Vector}
 */
export function getCell(pos) {
  const { width: bWidth, height: bHeight } = getDimensions();
  const i = Math.floor(pos.x / bWidth);
  const j = Math.floor(pos.y / bHeight);
  return new Vector(i, j);
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

/**
 * return object containing corner cell positions of given entity
 * @param {Entity} entity
 * @returns {{topLeft: Vector, bottomRight: Vector}}
 */
export function calcCorners(entity) {
  // Top left corner
  const topLeftCell = getCell(
    new Vector(
      entity.pos.x - entity.width / 2,
      entity.pos.y - entity.height / 2
    )
  );

  const bottomRightCell = getCell(
    new Vector(
      entity.pos.x + entity.width / 2,
      entity.pos.y + entity.height / 2
    )
  );

  return { topLeft: topLeftCell, bottomRight: bottomRightCell };
}

/**
 * Returns a list of collision objects to represent the cells the entiity is
 * colliding with.
 * @param {Entity} entity
 */
export function collideWithWorld(entity) {
  const { width: blockWidth, height: blockHeight } = getDimensions();

  const { topLeft: topLeft, bottomRight: bottomRight } = calcCorners(entity);

  let collidingEntities = [];

  // Iterate over any block within collision range of the entity
  for (let i = topLeft.x; i < bottomRight.x + 1; i++) {
    for (let j = topLeft.y; j < bottomRight.y + 1; j++) {
      // If this block is solid, create an entity for it
      if (solidAt(i, j)) {
        let x = (i + 1) * blockWidth - blockWidth / 2;
        let y = (j + 1) * blockHeight - blockHeight / 2;
        let e = new Entity(new Vector(x, y));
        e.width = blockWidth;
        e.height = blockHeight;

        // Determine if this cell needs has neighbors, and thus if it needs collision.
        if (solidAt(i + 1, j)) e.collidesRight = false;
        if (solidAt(i - 1, j)) e.collidesLeft = false;
        if (solidAt(i, j - 1)) e.collidesTop = false;
        if (solidAt(i, j + 1)) e.collidesBottom = false;

        // If any of it's walls are solid, add the entitiy.
        if (
          e.collidesBottom ||
          e.collidesTop ||
          e.collidesLeft ||
          e.collidesRight
        )
          collidingEntities.push(e);
      }
    }
  }
  return collidingEntities;
}

/**
 * Determines if two entities are colliding
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @returns {boolean}
 */
export function isColliding(entityA, entityB) {
  const aLeft = entityA.pos.x - entityA.width / 2;
  const aTop = entityA.pos.y - entityA.height / 2;
  const bLeft = entityB.pos.x - entityB.width / 2;
  const bTop = entityB.pos.y - entityB.height / 2;

  if (
    aLeft + entityA.width > bLeft &&
    aLeft < bLeft + entityB.width &&
    aTop + entityA.height > bTop &&
    aTop < bTop + entityB.height
  ) {
    return true;
  }
  return false;
}

/**
 * Determines if two entities are colliding and if damage should take place
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @param {number} cheatRadius
 */
export function isCollidingCheat(entityA, entityB, cheatRadius) {
  return (
    entityA.pos.sub(entityB.pos).mag() <
    entityA.width / 2 + entityB.width / 2 - cheatRadius
  );
}

/**
 * Given two entities A and B, calculates the smallest vector needed to apply
 * to entity A to prevent collision. Returns empty vector if A and B are not
 * colliding. Assumes rectangle A does not surround rectangle B
 * @param {Entity} entityA
 * @param {Entity} entityB
 * @returns {Vector}
 */
export function calculateCollisionVector(entityA, entityB) {
  // If they aren't colliding, the vector is (0,0)
  // TODO: determine if this is needed. Removing it would be slightly faster.
  if (!(isColliding(entityA, entityB) || isColliding(entityB, entityA)))
    return new Vector(0, 0);

  // Define the 4 corners of each bounding rectangle
  const aRight = entityA.pos.x + entityA.width / 2;
  const aLeft = entityA.pos.x - entityA.width / 2;
  const aBottom = entityA.pos.y + entityA.height / 2;
  const aTop = entityA.pos.y - entityA.height / 2;
  const bRight = entityB.pos.x + entityB.width / 2;
  const bLeft = entityB.pos.x - entityB.width / 2;
  const bBottom = entityB.pos.y + entityB.height / 2;
  const bTop = entityB.pos.y - entityB.height / 2;

  let cVector = new Vector(0, 0);
  // If the right wall of A is between the horizontal walls of B
  if (bLeft < aRight && aRight < bRight) {
    cVector.x = aRight - bLeft;
  }
  // If the left wall of A is between the horizontal walls of B
  if (bLeft < aLeft && aLeft < bRight) {
    cVector.x = aLeft - bRight;
  }
  // If the bottom wall of A is between the vertical walls of B
  if (bTop < aBottom && aBottom < bBottom) {
    cVector.y = aBottom - bTop;
  }
  // If the top wall of A is between the vertical walls of B
  if (bTop < aTop && aTop < bBottom) {
    cVector.y = aTop - bBottom;
  }

  // If the entity doesn't have collision in a direction, make sure it doesn't
  // have the vector points that way.
  if (!entityB.collidesBottom) cVector.y = Math.max(0, cVector.y);
  if (!entityB.collidesTop) cVector.y = Math.min(0, cVector.y);
  if (!entityB.collidesLeft) cVector.x = Math.min(0, cVector.x);
  if (!entityB.collidesRight) cVector.x = Math.max(0, cVector.x);

  // Only return the "easier" direction to resolve from.
  // TODO: figure out why this works?
  if (Math.abs(cVector.x) < Math.abs(cVector.y) && cVector.x != 0) {
    cVector.y = 0;
  } else if (Math.abs(cVector.y) < Math.abs(cVector.x) && cVector.y != 0) {
    cVector.x = 0;
  }

  return cVector;
}

/**
 * move the entity based on collisions with walls
 * @param {Entity} entity
 */
export function adjustEntity(entity) {
  // Initialize collision list with collisions between entity and the world
  //console.log(entity.type);
  /** @type {Entity[]} */
  const collidingEntities = collideWithWorld(entity);

  /** @type {Vector[]} */
  const collisionVectors = [];

  /** @type {Entity[]} */
  const hitEntities = [];

  // Iterate through each colliding entity, and get a vector that defines how
  // "collided" they are
  for (let i = 0; i < collidingEntities.length; i++) {
    const collisionVector = calculateCollisionVector(
      entity,
      collidingEntities[i]
    );
    if (!collisionVector.isZeroVec()) {
      collisionVectors.push(collisionVector);
      hitEntities.push(collidingEntities[i]);
    }
  }
  if (entity.occludedByWalls) {
    // Keep track of how far entity moved during adjustment.
    const mv = new Vector(0, 0);
    // For each colliding vector, resolve the collision.
    for (let i = 0; i < collisionVectors.length; i++) {
      const cv = collisionVectors[i];
      if (Math.abs(cv.x) > Math.abs(cv.y) && cv.x != 0) {
        // If x is the "easiest" solution (but not 0), use x.
        if (Math.abs(cv.x) > Math.abs(mv.x)) {
          mv.x = cv.x;
        }
      } else if (Math.abs(cv.y) > Math.abs(cv.x) && cv.y != 0) {
        // If y is the "easiest" solution (but not 0), use y.
        if (Math.abs(cv.y) > Math.abs(mv.y)) {
          mv.y = cv.y;
        }
      } else {
        // If X and Y are equal, resolve them both.
        entity.pos.x -= cv.x;
        entity.pos.y -= cv.y;
      }
    }

    entity.pos = entity.pos.sub(mv);

    // bounce based on the move vector
    if (entity.reflectsOffWalls) {
      if (mv.x !== 0) entity.vel.x *= -1;
      if (mv.y !== 0) entity.vel.y *= -1;
      if (hitEntities.length > 0 && entity.wallReflectSpeed !== 0) {
        entity.vel = entity.vel.norm2().mult(entity.wallReflectSpeed);
      }
    } else {
      // if we're not supposed to bounce then just stop
      if (mv.x !== 0) entity.vel.x = 0;
      if (mv.y !== 0) entity.vel.y = 0;
    }
  }

  // fire block collision method
  for (let i = 0; i < hitEntities.length; i++) {
    entity.collideWithBlock(hitEntities[i]);
  }
}
