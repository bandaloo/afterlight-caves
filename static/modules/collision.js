import { Entity } from "./entity.js";
import { getBlockDimensions, getTerrain } from "./gamemanager.js";
import { Vector } from "./vector.js";

/**
 * @param {Vector} pos
 * @returns {Vector}
 */
export function getCell(pos) {
  const { width: bWidth, height: bHeight } = getBlockDimensions();
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
  const { width: blockWidth, height: blockHeight } = getBlockDimensions();

  const { topLeft: topLeft, bottomRight: bottomRight } = calcCorners(shape);

  let terrainCollision = [];

  // Iterate over any block within collision range of the entity
  for (let i = topLeft.x; i < bottomRight.x + 1; i++) {
    for (let j = topLeft.y; j < bottomRight.y + 1; j++) {
      // If this block is solid, create an entity for it
      if (solidAt(i, j)) {
        let x = (i + 1) * blockWidth - blockWidth / 2;
        let y = (j + 1) * blockHeight - blockHeight / 2;
        let b = new TerrainBox(
          blockHeight,
          blockWidth,
          new Vector(x, y),
          undefined,
          true
        );

        // Determine if this cell needs has neighbors, and thus if it needs
        // collision.
        if (solidAt(i + 1, j)) b.collidesRight = false;
        if (solidAt(i - 1, j)) b.collidesLeft = false;
        if (solidAt(i, j - 1)) b.collidesTop = false;
        if (solidAt(i, j + 1)) b.collidesBottom = false;

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
  if (shapeA instanceof CollisionBox && shapeB instanceof CollisionBox) {
    return collide_BoxBox(
      /* @type {Box} */ (shapeA),
      /* @type {Box} */ (shapeB),
      resolve
    );
  } else if (
    shapeA instanceof CollisionCircle &&
    shapeB instanceof CollisionBox
  ) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeB),
      /* @type {Circle} */ (shapeA),
      resolve
    );
  } else if (
    shapeA instanceof CollisionBox &&
    shapeB instanceof CollisionCircle
  ) {
    return collide_BoxCircle(
      /* @type {Box} */ (shapeA),
      /* @type {Circle} */ (shapeB),
      resolve
    );
  } else if (
    shapeA instanceof CollisionCircle &&
    shapeB instanceof CollisionCircle
  ) {
    return collide_CircleCircle(
      /* @type {Circle} */ (shapeA),
      /* @type {Circle} */ (shapeB),
      resolve
    );
  } else if (
    shapeA instanceof CollisionCircle &&
    shapeB instanceof CollisionBeam
  ) {
    return collide_CircleBeam(shapeA, shapeB, resolve);
  } else if (
    shapeA instanceof CollisionBeam &&
    shapeB instanceof CollisionCircle
  ) {
    return collide_CircleBeam(shapeB, shapeA, resolve);
  } else if (
    shapeA instanceof CollisionBox &&
    shapeB instanceof CollisionBeam
  ) {
    return collide_BoxBeam(shapeA, shapeB, resolve);
  } else if (
    shapeA instanceof CollisionBeam &&
    shapeB instanceof CollisionBox
  ) {
    return collide_BoxBeam(shapeB, shapeA, resolve);
  } else {
    return new Vector(0, 0);
  }
}

/**
 * Determines if a circle is colliding with a beam
 * This is mostly accurate, but it's more like a pill than a rectangle
 * @param {CollisionCircle} circle
 * @param {CollisionBeam} beam
 * @param {boolean} resolve ignored. TODO implement
 * @return {Vector}
 */
export function collide_CircleBeam(circle, beam, resolve) {
  const dist = circle.pos.distToSeg(beam.p1, beam.p2);

  let cVector = new Vector(0, 0);
  if (dist < circle.radius + beam.thickness / 2) {
    return new Vector(1, 1);
  }
  return cVector;
}

/**
 * Determines if a box is colliding with a beam. Accounts for beam thickness by
 * simulating two lines, one on each edge of the beam. This is mostly accurate,
 * but misses the (usually tiny) area in the center of the beam
 * @param {CollisionBox} box
 * @param {CollisionBeam} beam
 * @param {boolean} resolve ignored. TODO implement
 * @return {Vector}
 */
export function collide_BoxBeam(box, beam, resolve) {
  const perp = beam.p2.sub(beam.p1).perpendicular();
  const l1p1 = beam.p1.add(perp.mult(beam.thickness / 2));
  const l1p2 = beam.p2.add(perp.mult(beam.thickness / 2));
  if (rectangleIntersectsLine(box, l1p1, l1p2)) return new Vector(1, 1);
  const l2p1 = beam.p1.add(perp.mult(-beam.thickness / 2));
  const l2p2 = beam.p2.add(perp.mult(-beam.thickness / 2));
  if (rectangleIntersectsLine(box, l2p1, l2p2)) return new Vector(1, 1);
  return new Vector(0, 0);
}

/**
 * helper that determines whether a rectangle intersects a line
 * @param {CollisionBox} box
 * @param {Vector} p1
 * @param {Vector} p2
 */
function rectangleIntersectsLine(box, p1, p2) {
  const topLeft = new Vector(
    box.pos.x - box.width / 2,
    box.pos.y - box.height / 2
  );
  const topRight = new Vector(
    box.pos.x + box.width / 2,
    box.pos.y - box.height / 2
  );
  const bottomRight = new Vector(
    box.pos.x + box.width / 2,
    box.pos.y + box.height / 2
  );
  const bottomLeft = new Vector(
    box.pos.x - box.width / 2,
    box.pos.y + box.height / 2
  );

  return (
    lineIntersectsLine(p1, p2, topLeft, topRight) ||
    lineIntersectsLine(p1, p2, topRight, bottomRight) ||
    lineIntersectsLine(p1, p2, bottomRight, bottomLeft) ||
    lineIntersectsLine(p1, p2, bottomLeft, topLeft) ||
    // contains p1
    (p1.x <= topRight.x &&
      p1.x >= topLeft.x &&
      p1.y >= topRight.y &&
      p1.y <= bottomRight.y) ||
    // contains p2
    (p2.x <= topRight.x &&
      p2.x >= topLeft.x &&
      p2.y >= topRight.y &&
      p2.y <= bottomRight.y)
  );
}

/**
 * Helper to determine whether two lines intersect. No, I don't know how this
 * works
 * Source: https://stackoverflow.com/questions/5514366/how-to-know-if-a-line-intersects-a-rectangle
 * @param {Vector} l1p1 line 1 point 1
 * @param {Vector} l1p2 line 1 point 2
 * @param {Vector} l2p1 line 2 point 1
 * @param {Vector} l2p2 line 2 point 2
 * @return {boolean}
 */
function lineIntersectsLine(l1p1, l1p2, l2p1, l2p2) {
  let q = l2p2.sub(l2p1).cross(l1p1.sub(l2p1));
  const d = l1p2.sub(l1p1).cross(l2p2.sub(l2p1));
  if (d === 0) return false;
  const r = q / d;
  q = l1p2.sub(l1p1).cross(l1p1.sub(l2p1));
  const s = q / d;
  return !(r < 0 || r > 1 || s < 0 || s > 1);
}

/**
 * Determines if two Circles are colliding
 * @param {CollisionCircle} circleA
 * @param {CollisionCircle} circleB
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
 * @param {CollisionBox} boxA
 * @param {CollisionCircle} circleB
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
  const aTopLeft = new Vector(aLeft, aTop); // Top Left
  const aTopRight = new Vector(aRight, aTop); // Top Right
  const aBottomLeft = new Vector(aLeft, aBottom); // Bottom Left
  const aBottomRight = new Vector(aRight, aBottom); // Bottom Right
  const aRightSide = [aTopRight, aBottomRight];
  const aLeftSide = [aBottomLeft, aTopRight];
  const aBottomSide = [aBottomRight, aBottomLeft];
  const aTopSide = [aTopLeft, aTopRight];
  const points = [];
  if (boxA instanceof TerrainBox) {
    if (boxA.collidesLeft && boxA.collidesTop) points.push(aTopLeft);
    if (boxA.collidesRight && boxA.collidesTop) points.push(aTopRight);
    if (boxA.collidesLeft && boxA.collidesBottom) points.push(aBottomLeft);
    if (boxA.collidesRight && boxA.collidesBottom) points.push(aBottomRight);
  } else {
    points.push(aTopLeft);
    points.push(aTopRight);
    points.push(aBottomLeft);
    points.push(aBottomRight);
  }
  const sides = [];
  if (boxA instanceof TerrainBox) {
    if (boxA.collidesTop) sides.push(aTopSide);
    if (boxA.collidesBottom) sides.push(aBottomSide);
    if (boxA.collidesLeft) sides.push(aLeftSide);
    if (boxA.collidesRight) sides.push(aRightSide);
  } else {
    sides.push(aTopSide);
    sides.push(aBottomSide);
    sides.push(aLeftSide);
    sides.push(aRightSide);
  }

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
    if (aLeft < circleB.pos.x && circleB.pos.x < aRight) {
      // If the bottom bounds of A is between the vertical bounds of B
      if (
        bTop < aBottom &&
        aBottom < bBottom &&
        (!(boxA instanceof TerrainBox) || boxA.collidesBottom)
      ) {
        cVector.y = bTop - aBottom;
      }
      // If the top bounds of A is between the vertical bounds of B
      if (
        bTop < aTop &&
        aTop < bBottom &&
        (!(boxA instanceof TerrainBox) || boxA.collidesTop)
      ) {
        cVector.y = bBottom - aTop;
      }
    }
    if (aTop < circleB.pos.y && circleB.pos.y < aBottom) {
      if (
        bLeft < aRight &&
        aRight < bRight &&
        (!(boxA instanceof TerrainBox) || boxA.collidesRight)
      ) {
        // If the right bounds of A is between the horizontal bounds of B
        cVector.x = bLeft - aRight;
      }
      // If the left bounds of A is between the horizontal bounds of B
      if (
        bLeft < aLeft &&
        aLeft < bRight &&
        (!(boxA instanceof TerrainBox) || boxA.collidesLeft)
      ) {
        cVector.x = bRight - aLeft;
      }
    }
    // If there was a collision, resolve it.
    if (!cVector.isZeroVec()) {
      if (!resolve) return new Vector(1, 1);

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
  let collisionDistance = radius2;
  for (let corner of points) {
    if (circleB.pos.dist2(corner) < collisionDistance) {
      collidingCorner = corner;
      collisionDistance = circleB.pos.dist(corner);
    }
  }
  // If there were collisions with the corners, check to see if they need
  // to be resolved.
  if (collidingCorner !== undefined) {
    const dist = new Vector(
      circleB.pos.x - collidingCorner.x,
      circleB.pos.y - collidingCorner.y
    );

    // the collision vector should push the circle to be the distance away equal
    // to the circle's radius or higher.
    cVector = dist.norm2().mult(Math.min(dist.mag() - circleB.radius, 0));

    // If this is not the zero vector, then resolve the collision
    if (!cVector.isZeroVec()) {
      if (!resolve) return new Vector(1, 1);
      return cVector;
    }
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

    if (distance.isZeroVec()) {
      cVector = new Vector(
        boxA.width / 2 + circleB.radius,
        boxA.height / 2 + circleB.radius
      );
    } else {
      if (circleB.vel.isZeroVec() && boxA.vel.isZeroVec()) {
        cVector = new Vector(circleB.radius * 2 + boxA.width, 0);
      } else {
        cVector = circleB.vel.add(boxA.vel.mult(-1));
      }
    }

    return cVector;
  }

  return cVector;
}

/**
 * Calculates the collision vector for two boxes
 * @param {CollisionBox} boxA
 * @param {CollisionBox} boxB
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
    (aLeft + boxA.width > bLeft &&
      aLeft < bLeft + boxB.width &&
      aTop + boxA.height > bTop &&
      aTop < bTop + boxB.height) ||
    (bLeft + boxB.width > aLeft &&
      bLeft < aLeft + boxA.width &&
      bTop + boxB.height > aTop &&
      bTop < aTop + boxA.height)
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

    if (cVector.isZeroVec()) {
      // If the right wall of B is between the horizontal walls of A
      if (aLeft < bRight && bRight < aRight) {
        cVector.x = bRight - aLeft;
      }
      // If the left wall of B is between the horizontal walls of A
      if (aLeft < bLeft && bLeft < aRight) {
        cVector.x = bLeft - aRight;
      }
      // If the bottom wall of B is between the vertical walls of A
      if (aTop < bBottom && bBottom < aBottom) {
        cVector.y = bBottom - aTop;
      }
      // If the top wall of B is between the vertical walls of A
      if (aTop < bTop && bTop < aBottom) {
        cVector.y = bTop - aBottom;
      }
    }

    if (boxA instanceof TerrainBox) {
      if (!boxA.collidesTop) cVector.y = Math.min(cVector.y, 0);
      if (!boxA.collidesBottom) cVector.y = Math.max(cVector.y, 0);
      if (!boxA.collidesLeft) cVector.x = Math.min(cVector.x, 0);
      if (!boxA.collidesRight) cVector.x = Math.max(cVector.x, 0);
    }

    if (boxB instanceof TerrainBox) {
      if (!boxB.collidesTop) cVector.y = Math.min(cVector.y, 0);
      if (!boxB.collidesBottom) cVector.y = Math.max(cVector.y, 0);
      if (!boxB.collidesLeft) cVector.x = Math.min(cVector.x, 0);
      if (!boxB.collidesRight) cVector.x = Math.max(cVector.x, 0);
    }

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

  /** @type {TerrainBox[]} */
  const terrainCollision = collideWithWorld(entity.getTerrainCollisionShape());

  /** @type {Vector[]} */
  const collisionVectors = [];

  /** @type {CollisionBox[]} */
  const hitTerrain = [];

  // Iterate through each colliding entity, and get a vector that defines how
  // "collided" they are
  for (let i = 0; i < terrainCollision.length; i++) {
    const collisionVector = collide(
      entity.getTerrainCollisionShape(),
      terrainCollision[i]
    );

    // A block shouldn't be breakable if it is surrounded, though it should
    // still be collidable for diagonal edge cases.
    const isBreakable =
      terrainCollision[i].collidesTop ||
      terrainCollision[i].collidesBottom ||
      terrainCollision[i].collidesRight ||
      terrainCollision[i].collidesLeft;

    if (!collisionVector.isZeroVec()) {
      collisionVectors.push(collisionVector);
      if (isBreakable) {
        hitTerrain.push(terrainCollision[i]);
      }
    }
  }
  if (entity.occludedByWalls) {
    // Keep track of how far entity moved during adjustment.
    let mv = new Vector(0, 0);

    /** TODO: this is used to prevent multiple of the same collision from
     * different wall tiles from being applied. The "correct" solution is to
     * build the "world" collision objects better but that's difficult and slow.
     */
    let alreadyAppliedVectorsX = [];
    let alreadyAppliedVectorsY = [];

    // For each colliding vector, resolve the collision.
    for (let i = 0; i < collisionVectors.length; i++) {
      const cv = collisionVectors[i];
      if (!alreadyAppliedVectorsX.includes(cv.x)) {
        mv.x += cv.x;
        alreadyAppliedVectorsX.push(cv.x);
      }
      if (!alreadyAppliedVectorsY.includes(cv.y)) {
        mv.y += cv.y;
        alreadyAppliedVectorsY.push(cv.y);
      }
    }

    entity.pos = entity.pos.sub(mv);

    // If an entity has reflectsOffWalls = true but wallReflectSpeed = 0 it
    // should reflect with the same speed it hit the wall with. See the
    // description of wallReflectSpeed in entity.js.
    if (entity.reflectsOffWalls) {
      if (mv.x !== 0) entity.vel.x *= -1;
      if (mv.y !== 0) entity.vel.y *= -1;
      if (hitTerrain.length > 0 && entity.wallReflectSpeed !== 0) {
        entity.vel = entity.vel.norm2().mult(entity.wallReflectSpeed);
      }
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

  /** @type {Vector} */
  vel;

  /** @type {"Box"|"Circle"|"Beam"|"Not Defined"} */
  type;

  /** @type {number} */
  width;

  /** @type {number} */
  height;

  debug;

  /**
   * Class used to store collision information
   * @param {"Box"|"Circle"|"Beam"|"Not Defined"} type
   * @param {Vector} pos
   * @param {Vector} vel
   */
  constructor(
    type = "Not Defined",
    pos = new Vector(0, 0),
    vel = new Vector(0, 0),
    debug = false
  ) {
    this.type = type;
    this.pos = pos;
    this.vel = vel;
    this.debug = debug;
  }
}

export class CollisionBox extends CollisionShape {
  /**
   * Class used for axis-aligned box collision
   * @param {number} width
   * @param {number} height
   * @param {Vector} pos
   * @param {Vector} vel
   */
  constructor(width, height, pos, vel = new Vector(0, 0), debug = false) {
    super("Box", pos, vel, debug);
    this.width = width;
    this.height = height;
  }
}

export class TerrainBox extends CollisionBox {
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
   * @param {Vector} vel
   */
  constructor(width, height, pos, vel = new Vector(0, 0), debug = false) {
    super(width, height, pos, vel, debug);
  }
}

export class CollisionCircle extends CollisionShape {
  /** @type {number} */
  radius;

  /**
   * Class used for axis-aligned box collision
   * @param {number} radius
   * @param {Vector} pos
   * @param {Vector} vel
   */
  constructor(radius, pos, vel = new Vector(0, 0), debug = false) {
    super("Circle", pos, vel, debug);
    this.radius = radius;
    this.width = radius * 2;
    this.height = radius * 2;
  }
}

export class CollisionBeam extends CollisionShape {
  /** @type {Vector} end of the beam */
  p2;
  /** @type {number} */
  thickness;

  /**
   * A collision beam is a line with thickness, or a rectangle with a rotation
   * @param {Vector} p1 origin of the beam
   * @param {Vector} p2 end point of the beam
   * @param {number} [thickness] 1 by default
   */
  constructor(p1, p2, thickness = 1) {
    super("Beam", p1, new Vector(0, 0), false);
    this.p2 = p2;
    this.thickness = thickness;
  }

  get p1() {
    return this.pos;
  }
}

/**
 * Draws a ray from the given point in the given direction until it hits
 * terrain, then returns the coordinates of the point it hit
 * @param {Vector} startPos the starting position of the ray
 * @param {Vector} dir the direction the ray is facing
 * @return {Vector}
 */
export function nextIntersection(startPos, dir) {
  // TODO maybe this could be more optimized
  if (dir.isZeroVec()) return startPos; // no direction
  const cellVec = getCell(startPos);
  if (solidAt(cellVec.x, cellVec.y)) return startPos; // starting in a block
  dir = dir.norm2();
  const { width: bw, height: bh } = getBlockDimensions();
  const signVec = new Vector(Math.sign(dir.x), Math.sign(dir.y));

  /** @param {number} x gets the y value of the line at a particular x */
  const f = x => (dir.y / dir.x) * (x - startPos.x) + startPos.y;
  /** @param {number} y gets the x value of the line at a particular y */
  const g = y => (dir.x / dir.y) * (y - startPos.y) + startPos.x;

  if (signVec.x > 0) cellVec.x++;
  if (signVec.y > 0) cellVec.y++;
  while (true) {
    // go to the next block boundary
    const nextPos = cellVec.mult(bw, bh);
    const ny = dir.x === 0 ? nextPos.y : f(nextPos.x);
    const nx = dir.y === 0 ? nextPos.x : g(nextPos.y);

    if (
      signVec.x === 0 ||
      (signVec.y !== 0 && signVec.y * ny >= signVec.y * nextPos.y)
    ) {
      // the next intersection with the game grid is vertical
      const xInter = dir.x === 0 ? startPos.x : g(nextPos.y);
      const intersection = new Vector(xInter, nextPos.y + signVec.y);
      const blockToCheck = getCell(intersection);
      if (solidAt(blockToCheck.x, blockToCheck.y)) {
        return intersection;
      }
      cellVec.y += signVec.y;
    }
    if (
      signVec.y === 0 ||
      (signVec.x !== 0 && signVec.x * nx >= signVec.x * nextPos.x)
    ) {
      // next intersection is horizontal
      const yInter = dir.y === 0 ? startPos.y : f(nextPos.x);
      const intersection = new Vector(nextPos.x + signVec.x, yInter);
      const blockToCheck = getCell(intersection);
      if (solidAt(blockToCheck.x, blockToCheck.y)) {
        return intersection;
      }
      cellVec.x += signVec.x;
    }
  }
}
