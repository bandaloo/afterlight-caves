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
 * @param {CollisionShape} shape
 * @returns {{topLeft: Vector, bottomRight: Vector}}
 */
export function calcCorners(shape) {
  // Top left corner
  const topLeftCell = getCell(
    new Vector(shape.pos.x - shape.width / 2, shape.pos.y - shape.height / 2)
  );

  const bottomRightCell = getCell(
    new Vector(shape.pos.x + shape.width / 2, shape.pos.y + shape.height / 2)
  );

  return { topLeft: topLeftCell, bottomRight: bottomRightCell };
}

/**
 * Returns a list of collision objects to represent the cells the entiity is
 * colliding with.
 * @param {CollisionShape} shape
 */
export function collideWithWorld(shape) {
  const { width: blockWidth, height: blockHeight } = getDimensions();

  const { topLeft: topLeft, bottomRight: bottomRight } = calcCorners(shape);

  let terrainCollision = [];

  // Iterate over any block within collision range of the entity
  for (let i = topLeft.x; i < bottomRight.x + 1; i++) {
    for (let j = topLeft.y; j < bottomRight.y + 1; j++) {
      // If this block is solid, create an entity for it
      if (solidAt(i, j)) {
        let x = (i + 1) * blockWidth - blockWidth / 2;
        let y = (j + 1) * blockHeight - blockHeight / 2;
        let b = new Box(blockHeight, blockWidth, new Vector(x, y));

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
 * Given two Shapes A and B, calculates the smallest vector needed to apply
 * to entity A to prevent collision. Returns empty vector if A and B are not
 * colliding.
 * @param {CollisionShape} shapeA
 * @param {CollisionShape} shapeB
 * @returns {Vector}
 */
export function collide(shapeA, shapeB) {
  if (shapeA instanceof Box && shapeB instanceof Box) {
    return collide_BoxBox(
      /* @type {Box} */ (shapeA),
      /* @type {Box} */ (shapeB)
    );
  } else if (shapeA instanceof Circle && shapeB instanceof Box) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeB),
      /* @type {Circle} */ (shapeA)
    );
  } else if (shapeA instanceof Box && shapeB instanceof Circle) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeA),
      /* @type {Circle} */ (shapeB)
    );
  } else if (shapeA instanceof Circle && shapeB instanceof Circle) {
    return collide_CircleCircle(
      /* @type {Circle} */ (shapeA),
      /* @type {Circle} */ (shapeB)
    );
  } else {
    return new Vector(0, 0);
  }
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
 * Determines if two Circles are colliding
 * @param {Circle} circleA
 * @param {Circle} circleB
 * @returns {Vector}
 */
export function collide_CircleCircle(circleA, circleB) {
  const dist = circleA.pos.dist(circleB.pos);
  const radius = circleA.radius + circleB.radius;

  let cVector = new Vector(0, 0);
  // If the circles are colliding, find out by how much
  if (dist < radius) {
    const move = radius - dist;
    cVector.x = circleB.pos.x - circleA.pos.x;
    cVector.y = circleB.pos.y - circleA.pos.y;
    cVector = cVector.norm();
    cVector = cVector.mult(move);
  }

  return cVector;
}

/**
 * Determines if two Boxes are colliding
 * @param {Box} boxA
 * @param {Circle} circleB
 * @returns {Vector}
 */
export function collide_BoxCircle(boxA, circleB) {
  const aRight = boxA.pos.x + boxA.width / 2;
  const aLeft = boxA.pos.x - boxA.width / 2;
  const aBottom = boxA.pos.y + boxA.height / 2;
  const aTop = boxA.pos.y - boxA.height / 2;

  // let testX = circleB.pos.x;
  // let testY = circleB.pos.y;
  // if (circleB.pos.x < boxA.pos.x) testX = aLeft;
  // else if (circleB.pos.x > boxA.pos.x + boxA.width) testX = aRight;
  // if (circleB.pos.y < boxA.pos.y) testY = aTop;
  // else if (circleB.pos.y < boxA.pos.y + boxA.height) testY = aBottom;

  // // get distance from closest edges
  // let distX = circleB.pos.x - testX;
  // let distY = circleB.pos.y - testY;
  // let distance = Math.sqrt(distX * distX + distY * distY);

  let cVector = new Vector(0, 0);

  const nearestX = Math.max(aLeft, Math.min(circleB.pos.x, aRight));
  const nearestY = Math.max(aTop, Math.min(circleB.pos.y, aBottom));
  const nearestCorner = new Vector(nearestX, nearestY);

  // if the distance is less than the radius, collision!
  if (nearestCorner != circleB.pos) {
    let dist = circleB.pos.dist(nearestCorner);
    if (dist < circleB.radius && dist != 0) {
      // console.log(
      //   " dist from " +
      //     circleB.pos +
      //     " to " +
      //     nearestCorner +
      //     " shorter than " +
      //     circleB.radius
      // );
      console.log("collision!");

      //Find the closest corner
      const nearestX = Math.max(aLeft, Math.min(circleB.pos.x, aRight));
      const nearestY = Math.max(aTop, Math.min(circleB.pos.y, aBottom));
      // const dist = new Vector(circleB.pos.x - nearestX, circleB.pos.y - nearestY);
      // const depth = circleB.radius - dist.mag();
      // cVector = dist.norm();
      // cVector = cVector.mult(depth);
    }
  }

  return cVector;
}

/**
 * Calculates the collision vector for two boxes
 * @param {Box} boxA
 * @param {Box} boxB
 * @returns {Vector}
 */
export function collide_BoxBox(boxA, boxB) {
  // Define the 4 corners of each bounding rectangle
  const aRight = boxA.pos.x + boxA.width / 2;
  const aLeft = boxA.pos.x - boxA.width / 2;
  const aBottom = boxA.pos.y + boxA.height / 2;
  const aTop = boxA.pos.y - boxA.height / 2;
  const bRight = boxB.pos.x + boxB.width / 2;
  const bLeft = boxB.pos.x - boxB.width / 2;
  const bBottom = boxB.pos.y + boxB.height / 2;
  const bTop = boxB.pos.y - boxB.height / 2;

  //TODO: check to make sure A surrounding B still works.

  let cVector = new Vector(0, 0);
  // If the boxes are colliding, find out by how much
  if (
    aLeft + boxA.width > bLeft &&
    aLeft < bLeft + boxB.width &&
    aTop + boxA.height > bTop &&
    aTop < bTop + boxB.height
  ) {
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
    const collisionVector = collide(
      entity.getCollisionShape(),
      terrainCollision[i]
    );

    if (!collisionVector.isZeroVec()) {
      collisionVectors.push(collisionVector);
      hitTerrain.push(terrainCollision[i]);
    }
  }
  if (entity.occludedByWalls) {
    // Keep track of how far entity moved during adjustment.
    const mv = new Vector(0, 0);

    //TODO: this is used to prevent multiple of the same collision from different wall
    // tiles from being applied. The COREECT solution is to build the "world" collision objects better
    // do that.
    let alreadyAppliedVectorsX = [];
    let alreadyAppliedVectorsY = [];

    // For each colliding vector, resolve the collision.
    for (let i = 0; i < collisionVectors.length; i++) {
      const cv = collisionVectors[i];

      //TODO: This fixed multiple of the same collision being applied. Find another way.

      if (!alreadyAppliedVectorsX.includes(cv.x)) {
        entity.pos.x -= cv.x;
        alreadyAppliedVectorsX.push(cv.x);
      }
      if (!alreadyAppliedVectorsY.includes(cv.y)) {
        entity.pos.y -= cv.y;
        alreadyAppliedVectorsY.push(cv.y);
      }
      // }
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

  /** @type {number} */
  width;

  /** @type {number} */
  height;

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
    this.width = radius * 2;
    this.height = radius * 2;
  }
}
