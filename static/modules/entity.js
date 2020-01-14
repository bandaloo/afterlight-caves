import { Vector } from "./vector.js";
import { adjustEntity, isColliding } from "./collision.js";
import { getScreenDimensions, getCameraOffset } from "./gamemanager.js";

/**
 * an enum for types of actions on far away
 * @enum {number}
 */
export const FarEnum = Object.freeze({ nothing: 1, delete: 2, deactivate: 3 });

/** @abstract */
export class Entity {
  /** @type {string} */
  type;

  /** @type {number} */
  width = 0;

  /** @type {number} */
  height = 0;

  /** @type {number} */
  drag = 0;

  /** @type {number} */
  blockHitboxScalar = 1;

  /** @type {number} */
  entityHitboxScalar = 1;

  /** @type {number} */
  depth = 0;

  /** @type {boolean} whether or not this bounces off of walls */
  reflectsOffWalls = false;

  /**
   * Speed of this entity after bouncing off a wall. If set to 0 the entity
   * will have the same speed it had before the collision. Only has an effect
   * if this.reflectsOffWalls is true
   * @type {number}
   */
  wallReflectSpeed = 0;

  /** @type {number} maximum magnitude velocity can have */
  maxSpeed = Infinity;

  /** @type {number} maximum magnitude acceleration can have */
  maxAcc = Infinity;

  // TODO these are only useful for collision tests; is there a better way?
  /** @type {boolean} */
  collidesLeft = true;

  /** @type {boolean} */
  collidesRight = true;

  /** @type {boolean} */
  collidesTop = true;

  /** @type {boolean} */
  collidesBottom = true;

  /**
   * amount of game steps to live before entity is destroyed
   * @type {number}
   */
  lifetime = Infinity;

  /** @type {string[]} */
  collideTypes = [];

  /** @type {Map<string, (arg0: Entity) => void>}*/
  collideMap = new Map();

  /**
   * whether entity will get pushed out of walls
   * @type {boolean}
   */
  occludedByWalls = true;

  /**
   * draw position slightly differs from original position to tween between frames
   * @type {Vector}
   */
  drawPos;

  /**
   * whether the entity will be deleted in deferred deletion process
   * @type {boolean}
   */
  deleteMe = false;

  /**
   * @type {number}
   */
  farType = FarEnum.nothing;

  /**
   * @type {boolean}
   */
  active = true;

  /**
   * constructs an entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    this.pos = pos;
    this.drawPos = pos;
    this.lastPos = pos;
    /** @type {Vector} */
    this.vel = vel;
    /** @type {Vector} */
    this.acc = acc;
  }

  onScreen() {
    const { width: screenWidth, height: screenHeight } = getScreenDimensions();
    const screenEntity = new Entity(
      new Vector(screenWidth / 2, screenHeight / 2).add(
        getCameraOffset().mult(-1)
      )
    );
    //console.log(screenEntity.pos);
    screenEntity.width = screenWidth;
    screenEntity.height = screenHeight;
    return isColliding(this, screenEntity);
  }

  /**
   * draws the entity
   */
  draw() {}

  /**
   * steps the entity using position, velocity, acceleration and drag
   */
  step() {
    if (this.acc.mag() > this.maxAcc)
      this.acc = this.acc.norm2().mult(this.maxAcc);
    this.vel = this.vel.add(this.acc).mult(1 - this.drag);
    if (this.vel.mag() > this.maxSpeed)
      this.vel = this.vel.norm2().mult(this.maxSpeed);
    this.pos = this.pos.add(this.vel);
  }

  /**
   * adjust position based on world
   */
  adjust() {
    adjustEntity(this);
  }

  /**
   * non-movement actions to take on a step
   */
  action() {}

  /**
   * what to do when the entity is removed from the world
   */
  destroy() {}

  /**
   * resolve action on collision with an entity
   * @param {Entity} entity
   */
  collideWithEntity(entity) {
    this.collideMap.get(entity.type)(entity);
  }

  /**
   * @param {Entity} entity
   */
  collideWithBlock(entity) {}
}
