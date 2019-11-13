import { Vector } from "./vector.js";
import { adjustEntity } from "./hackcollision.js";

/** @abstract */
export class Entity {
  /** @type {string} */
  type;

  /** @type {number} */
  width;

  /** @type {number} */
  height;

  /** @type {number} */
  drag;

  /** @type {number} */
  blockHitboxScalar = 1;

  /** @type {number} */
  entityHitboxScalar = 1;

  /** @type {number} */
  depth = 0;

  /** @type {number} */
  bounciness = 0;

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
    // TODO figure out formula to apply drag
    this.vel = this.vel.add(this.acc).mult(1 - this.drag);
    this.pos = this.pos.add(this.vel);
  }

  // TODO the engine should have functionality for a solid tilemap world
  // (for now, the game programmer will just have to hack one in)

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
}
