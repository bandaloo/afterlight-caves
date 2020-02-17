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
 * Returns a list of collision objects to represent the cells the entiity is
 * colliding with.
 * @param {CollisionShape} shape
 * @returns {Box[]}
 */
export function collideWithWorld(shape) {
  const { width: blockWidth, height: blockHeight } = getDimensions();

  // Top left corner
  const top_left = getCell(
    new Vector(shape.pos.x - shape.width / 2, shape.pos.y - shape.height / 2)
  );

  const bottom_right = getCell(
    new Vector(shape.pos.x + shape.width / 2, shape.pos.y + shape.height / 2)
  );

  let terrainCollision = [];

  // Iterate over any block within collision range of the shape
  for (let i = top_left.x; i < bottom_right.x + 1; i++) {
    for (let j = top_left.y; j < bottom_right.y + 1; j++) {
      // If this block is solid, create a shape for it
      if (solidAt(i, j)) {
        let x = (i + 1) * blockWidth - blockWidth / 2;
        let y = (j + 1) * blockHeight - blockHeight / 2;
        let b = new Box(blockWidth, blockHeight, new Vector(x, y));

        // Determine if this cell needs has neighbors, and thus if it needs collision.
        if (solidAt(i + 1, j)) b.collidesRight = false;
        if (solidAt(i - 1, j)) b.collidesLeft = false;
        if (solidAt(i, j - 1)) b.collidesTop = false;
        if (solidAt(i, j + 1)) b.collidesBottom = false;

        // If any of it's walls are solid, add the entitiy.
        if (
          b.collidesBottom ||
          b.collidesTop ||
          b.collidesLeft ||
          b.collidesRight
        )
          terrainCollision.push(b);
      }
    }
  }
  return terrainCollision;
}

/**
 * Determines if two shapes are colliding if there is defined behavior
 * @param {CollisionShape} shapeA
 * @param {CollisionShape} shapeB
 * @returns {boolean}
 */
export function isColliding(shapeA, shapeB) {
  const typeA = shapeA.type;
  const typeB = shapeB.type;
  if (typeA == "Box" && typeB == "Box") {
    return isColliding_BoxBox(
      /* @type {Box} */ (shapeA),
      /* @type {Box} */ (shapeB)
    );
  } else if (typeA == "Circle" && typeB == "Box") {
    return isColliding_BoxCircle(
      /* @type {Box} */ (shapeB),
      /* @type {Circle} */ (shapeA)
    );
  } else if (typeA == "Box" && typeB == "Circle") {
    return isColliding_BoxCircle(
      /* @type {Box} */ (shapeA),
      /* @type {Circle} */ (shapeB)
    );
  } else if (typeA == "Circle" && typeB == "Circle") {
    return isColliding_CircleCircle(
      /* @type {Circle} */ (shapeA),
      /* @type {Circle} */ (shapeB)
    );
  } else {
    return false;
  }
}

/**
 * Determines if two Boxes are colliding
 * @param {Box} boxA
 * @param {Box} boxB
 * @returns {boolean}
 */
export function isColliding_BoxBox(boxA, boxB) {
  const aLeft = boxA.pos.x - boxA.width / 2;
  const aTop = boxA.pos.y - boxA.height / 2;
  const bLeft = boxB.pos.x - boxB.width / 2;
  const bTop = boxB.pos.y - boxB.height / 2;

  if (
    aLeft + boxA.width > bLeft &&
    aLeft < bLeft + boxB.width &&
    aTop + boxA.height > bTop &&
    aTop < bTop + boxB.height
  ) {
    return true;
  }
  return false;
}

/**
 * Determines if two Boxes are colliding
 * @param {Box} boxA
 * @param {Circle} circleB
 * @returns {boolean}
 */
export function isColliding_BoxCircle(boxA, circleB) {
  return false;
}

/**
 * Determines if two Circles are colliding
 * @param {Circle} circleA
 * @param {Circle} circleB
 * @returns {boolean}
 */
export function isColliding_CircleCircle(circleA, circleB) {
  const dist2 = circleA.pos.dist2(circleB.pos);
  const radius2 = Math.pow(circleA.radius + circleB.radius, 2);
  return dist2 < radius2;
}

/**
 * Determines if two entities are colliding and if damage should take place
 * @param {CollisionShape} shapeA
 * @param {CollisionShape} shapeB
 * @param {number} cheatRadius
 */
export function isCollidingCheat(shapeA, shapeB, cheatRadius) {
  return (
    shapeA.pos.sub(shapeB.pos).mag() <
    shapeA.width / 2 + shapeB.width / 2 - cheatRadius
  );
}

/**
 * Given two entities A and B, calculates the smallest vector needed to apply
 * to entity A to prevent collision. Returns empty vector if A and B are not
 * colliding. Assumes rectangle A does not surround rectangle B
 * @param {Box} boxA
 * @param {Box} boxB
 * @returns {Vector}
 */
export function calculateCollisionVector_BoxBox(boxA, boxB) {
  // Define the 4 corners of each bounding rectangle
  const aRight = boxA.pos.x + boxA.width / 2;
  const aLeft = boxA.pos.x - boxA.width / 2;
  const aBottom = boxA.pos.y + boxA.height / 2;
  const aTop = boxA.pos.y - boxA.height / 2;
  const bRight = boxB.pos.x + boxB.width / 2;
  const bLeft = boxB.pos.x - boxB.width / 2;
  const bBottom = boxB.pos.y + boxB.height / 2;
  const bTop = boxB.pos.y - boxB.height / 2;

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

  // If the shape doesn't have collision in a direction, make sure it doesn't
  // have the vector points that way.
  if (!boxB.collidesBottom) cVector.y = Math.max(0, cVector.y);
  if (!boxB.collidesTop) cVector.y = Math.min(0, cVector.y);
  if (!boxB.collidesLeft) cVector.x = Math.min(0, cVector.x);
  if (!boxB.collidesRight) cVector.x = Math.max(0, cVector.x);

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
 * move the shape based on collisions with walls
 * @param {Entity} entity
 */
export function adjustEntity(entity) {
  // Initialize collision list with collisions between entity and the world

  /** @type {Box[]} */
  const terrainCollision = collideWithWorld(entity.getCollisionShape());

  /** @type {Vector[]} */
  const collisionVectors = [];

  /** @type {Box[]} */
  const hitTerrain = [];

  // Iterate through each colliding entity, and get a vector that defines how
  // "collided" they are
  for (let i = 0; i < terrainCollision.length; i++) {
    const collisionVector = calculateCollisionVector(
      entity.getCollisionShape(),
      terrainCollision[i]
    );

    if (!collisionVector.isZeroVec()) {
      console.log("colliding");
      collisionVectors.push(collisionVector);
      hitTerrain.push(terrainCollision[i]);
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
      if (hitTerrain.length > 0 && entity.wallReflectSpeed !== 0) {
        entity.vel = entity.vel.norm2().mult(entity.wallReflectSpeed);
      }
    } else {
      // if we're not supposed to bounce then just stop
      if (mv.x !== 0) entity.vel.x = 0;
      if (mv.y !== 0) entity.vel.y = 0;
    }
  }

  // fire block collision method
  for (let i = 0; i < hitTerrain.length; i++) {
    entity.collideWithBlock(hitTerrain[i].pos);
  }
}

export class CollisionShape {
  /** @type {Vector} */
  pos;

  /** @type {"Box"|"Circle"|"undefined"} */
  type;

  /**
   * Class used to store collision information
   * @param {"Box"|"Circle"|"undefined"} type
   * @param {Vector} pos
   */
  constructor(type = "undefined", pos = new Vector(0, 0)) {
    this.type = type;
    this.pos = pos;
  }
}

export class Box extends CollisionShape {
  /** @type {number} */
  width;

  /** @type {number} */
  height;

  /** @type {boolean} */
  collidesLeft = true;

  /** @type {boolean} */
  collidesRight = true;

  /** @type {boolean} */
  collidesTop = true;

  /** @type {boolean} */
  collidesBottom = true;

  /**
   * Class used for axis-aligned box collision
   * @param {number} width
   * @param {number} height
   * @param {Vector} pos
   */
  constructor(width, height, pos) {
    super("Box", pos);
    this.width = width;
    this.height = height;
  }
}

export class Circle extends CollisionShape {
  /** @type {number} */
  radius;

  /**
   * Class used for axis-aligned box collision
   * @param {number} radius
   * @param {Vector} pos
   */
  constructor(radius, pos) {
    super("Circle", pos);
    this.radius = radius;
  }
}
