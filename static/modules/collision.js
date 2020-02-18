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

        // Determine if this cell needs has neighbors, and thus if it needs
        // collision.
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
 * Given two CollisionShapes A and B, determines if the shapes are colliding.
 * Acts as wrapper for collide(CollisionShape, CollisionShape, resolve = false).
 * @param {CollisionShape} shapeA
 * @param {CollisionShape} shapeB
 * @returns {boolean}
 */
export function isColliding(shapeA, shapeB) {
  return !collide(shapeA, shapeB, false).isZeroVec();
}

/**
 * Given two CollisionShapes A and B, calculates the smallest vector needed to
 * apply to entity A to prevent collision. Returns empty vector if A and B are
 * not colliding.
 *
 * If resolve is False, it will return either Vector(0, 0) for no collision or
 * Vector(1, 1) if there is collision. This is used so that determining if
 * collision exists is faster.
 * @param {CollisionShape} shapeA
 * @param {CollisionShape} shapeB
 * @param {boolean} resolve
 * @returns {Vector}
 */
export function collide(shapeA, shapeB, resolve = true) {
  if (shapeA instanceof Box && shapeB instanceof Box) {
    return collide_BoxBox(
      /* @type {Box} */ (shapeA),
      /* @type {Box} */ (shapeB),
      resolve
    );
  } else if (shapeA instanceof Circle && shapeB instanceof Box) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeB),
      /* @type {Circle} */ (shapeA),
      resolve
    );
  } else if (shapeA instanceof Box && shapeB instanceof Circle) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeA),
      /* @type {Circle} */ (shapeB),
      resolve
    );
  } else if (shapeA instanceof Circle && shapeB instanceof Circle) {
    return collide_CircleCircle(
      /* @type {Circle} */ (shapeA),
      /* @type {Circle} */ (shapeB),
      resolve
    );
  } else {
    return new Vector(0, 0);
  }
}

/**
 * Determines if two Circles are colliding
 * @param {Circle} circleA
 * @param {Circle} circleB
 * @param {boolean} resolve
 * @returns {Vector}
 */
export function collide_CircleCircle(circleA, circleB, resolve) {
  const dist = circleA.pos.dist(circleB.pos);
  const radius = circleA.radius + circleB.radius;

  let cVector = new Vector(0, 0);
  // If the circles are colliding, find out by how much
  if (dist < radius) {
    if (!resolve) return new Vector(1, 1);
    const move = radius - dist;
    cVector.x = circleA.pos.x - circleB.pos.x;
    cVector.y = circleA.pos.y - circleB.pos.y;
    cVector = cVector.norm2();
    cVector = cVector.mult(move);
  }

  return cVector;
}

/**
 * Determines if a box and a circle are colliding
 * @param {Box} boxA
 * @param {Circle} circleB
 * @param {boolean} resolve
 * @returns {Vector}
 */
export function collide_BoxCircle(boxA, circleB, resolve) {
  // Short-Circut for speed
  const distanceBetween = circleB.pos.dist(boxA.pos);
  const vecBetween = circleB.pos.sub(boxA.pos);
  if (circleB.pos.dist(boxA.pos) > boxA.width + circleB.radius) {
    return new Vector(0, 0);
  }

  // Define box constants
  // These constraints are helpful so that we don't calculate collision for
  // parts of the box that are inactive, i.e. a box that doesn't collide on
  // the top won't include it's top line segment.
  const aRight = boxA.pos.x + boxA.width / 2;
  const aLeft = boxA.pos.x - boxA.width / 2;
  const aBottom = boxA.pos.y + boxA.height / 2;
  const aTop = boxA.pos.y - boxA.height / 2;
  const points = [];
  if (boxA.collidesLeft && boxA.collidesTop)
    points.push(new Vector(aLeft, aTop)); // Top Left
  if (boxA.collidesRight && boxA.collidesTop)
    points.push(new Vector(aRight, aTop)); // Top Right
  if (boxA.collidesLeft && boxA.collidesBottom)
    points.push(new Vector(aLeft, aBottom)); // Bottom Left
  if (boxA.collidesRight && boxA.collidesBottom)
    points.push(new Vector(aRight, aBottom)); // Bottom Right

  const sides = [];
  if (boxA.collidesTop) sides.push([points[0], points[2]]);
  if (boxA.collidesBottom) sides.push([points[1], points[3]]);
  if (boxA.collidesLeft) sides.push([points[0], points[1]]);
  if (boxA.collidesRight) sides.push([points[2], points[3]]);

  // Define circle constants
  const bRight = circleB.pos.x + circleB.radius;
  const bLeft = circleB.pos.x - circleB.radius;
  const bBottom = circleB.pos.y + circleB.radius;
  const bTop = circleB.pos.y - circleB.radius;
  //Radius2 used for comparing with dist2
  const radius2 = circleB.radius ** 2;

  //The return vector
  let cVector = new Vector(0, 0);

  // Firstly, if the circle's position is within the horizontal or vertical bounds of the box, check for side collision.
  // TODO: This is very similar to the BoxvBox collision code, we should make this more DRY
  if (
    (aTop < circleB.pos.y && circleB.pos.y < aBottom) ||
    (aLeft < circleB.pos.x && circleB.pos.x < aRight)
  ) {
    // If the right bounds of A is between the horizontal bounds of B
    if (bLeft < aRight && aRight < bRight) {
      cVector.x = bLeft - aRight;
    }
    // If the left bounds of A is between the horizontal bounds of B
    if (bLeft < aLeft && aLeft < bRight) {
      cVector.x = bRight - aLeft;
    }
    // If the bottom bounds of A is between the vertical bounds of B
    if (bTop < aBottom && aBottom < bBottom) {
      cVector.y = bTop - aBottom;
    }
    // If the top bounds of A is between the vertical bounds of B
    if (bTop < aTop && aTop < bBottom) {
      cVector.y = bBottom - aTop;
    }

    // If there was a collision, resolve it.
    if (!cVector.isZeroVec()) {
      if (!resolve) return new Vector(1, 1);
      // If the shape doesn't have collision in a direction, make sure it doesn't
      // have the vector points that way.
      if (!boxA.collidesBottom) cVector.y = Math.max(0, cVector.y);
      if (!boxA.collidesTop) cVector.y = Math.min(0, cVector.y);
      if (!boxA.collidesLeft) cVector.x = Math.min(0, cVector.x);
      if (!boxA.collidesRight) cVector.x = Math.max(0, cVector.x);

      // Only return the "easier" direction to resolve from.
      if (Math.abs(cVector.x) < Math.abs(cVector.y) && cVector.x != 0) {
        cVector.y = 0;
      } else if (Math.abs(cVector.y) < Math.abs(cVector.x) && cVector.y != 0) {
        cVector.x = 0;
      }

      return cVector;
    }
  }

  //Second, check if any of the corners are within the circle
  let collidingCorner = undefined;
  let collisionDistance = Infinity;
  for (let corner of points) {
    if (
      circleB.pos.dist2(corner) < radius2 &&
      circleB.pos.dist2(corner) < collisionDistance
    ) {
      collidingCorner = corner;
      collisionDistance = circleB.pos.dist(corner);
    }
  }
  // If there were collisions with the corners, resolve them.
  // Again, the below code is repreated maybe able to make more DRY.
  if (collidingCorner !== undefined) {
    if (!resolve) return new Vector(1, 1);
    const dist = new Vector(
      circleB.pos.x - collidingCorner.x,
      circleB.pos.y - collidingCorner.y
    );
    cVector = dist.norm2().mult(dist.mag() - circleB.radius);
    return cVector;
  }

  //Lastly, check if the box surrounds the circle
  const distance = new Vector(
    circleB.pos.x - boxA.pos.x,
    circleB.pos.y - boxA.pos.y
  );
  //If the circle's center is within the box, resolve the collision
  if (
    Math.abs(distance.x) < boxA.width / 2 &&
    Math.abs(distance.y) < boxA.height / 2
  ) {
    if (!resolve) return new Vector(1, 1);

    if (boxA.collidesBottom)
      cVector.y = Math.max(0, boxA.height / 2 + circleB.radius);
    else if (boxA.collidesTop)
      cVector.y = Math.max(0, -boxA.height / 2 + circleB.radius);
    else if (boxA.collidesLeft)
      cVector.y = Math.max(-boxA.width / 2 + circleB.radius, 0);
    else if (boxA.collidesRight)
      cVector.y = Math.max(boxA.width / 2 + circleB.radius, 0);

    if (distance.isZeroVec()) {
      cVector = new Vector(
        boxA.width / 2 + circleB.radius,
        boxA.height / 2 + circleB.radius
      );
    } else {
      cVector = distance.norm2().mult(distance.mag() - circleB.radius);
    }

    return cVector;
  }

  return cVector;
}

/**
 * Calculates the collision vector for two boxes
 * @param {Box} boxA
 * @param {Box} boxB
 * @param {boolean} resolve
 * @returns {Vector}
 */
export function collide_BoxBox(boxA, boxB, resolve) {
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
    if (!resolve) return new Vector(1, 1);
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
  const terrainCollision = collideWithWorld(entity.getTerrainCollisionShape());

  /** @type {Vector[]} */
  const collisionVectors = [];

  /** @type {Box[]} */
  const hitTerrain = [];

  // Iterate through each colliding entity, and get a vector that defines how
  // "collided" they are
  for (let i = 0; i < terrainCollision.length; i++) {
    const collisionVector = collide(
      entity.getTerrainCollisionShape(),
      terrainCollision[i]
    );

    if (!collisionVector.isZeroVec()) {
      collisionVectors.push(collisionVector);
      hitTerrain.push(terrainCollision[i]);
    }
  }
  if (entity.occludedByWalls) {
    // Keep track of how far entity moved during adjustment.
    let mv = new Vector(0, 0);

    // For each colliding vector, resolve the collision.
    for (let i = 0; i < collisionVectors.length; i++) {
      const cv = collisionVectors[i];
      mv = mv.add(cv);
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
