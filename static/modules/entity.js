import { Vector } from "./vector.js";
import { adjustEntity } from "./collision.js";

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

  /** @type {number} */
  bounciness = 0;

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

  // TODO incorporate this
  /**
   * whether entity will be pushed out of walls
   * @type {boolean}
   */
  hitsWalls = true;

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
   * constructs an entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    this.pos = pos;
    this.drawPos = pos;
    this.lastPos = pos;
    this.vel = vel;
    this.acc = acc;
  }

  /**
   * draws the entity
   */
  draw() {}

  /**
   * steps the entity using position, velocity, acceleration and drag
   */
  step() {
    this.vel = this.vel.add(this.acc).mult(1 - this.drag);
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

  // TODO make this function
  collide(entity) {}
}
