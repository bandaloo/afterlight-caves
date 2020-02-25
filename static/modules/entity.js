import { Vector } from "./vector.js";
import {
  adjustEntity,
  CollisionShape,
  CollisionBox,
  CollisionCircle,
  collide,
  CollisionBeam
} from "./collision.js";
import { getScreenDimensions, getCameraOffset } from "./displaymanager.js";

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

  /** @type {Vector} */
  pos;

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
  maxAccMag = Infinity;

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

  /** @type {number} */
  farType = FarEnum.nothing;

  /** @type {boolean} */
  active = true;

  /** @type {boolean} */
  pausable = true;

  /**
   * Determines what type of collision will be generated when getCollisionShape
   * is called and collisionShape is undefined.
   */
  /** @type {"Box"|"Circle"|"Beam"} */
  collisionType;

  /**
   * Allows for the collision shape of an entity to be overriden for terrain
   * collision. By default, it is just collisionShape.
   */
  /** @type {CollisionShape} */
  terrainCollisionShape;

  /**
   * Allows for the collision shape of an entity to be overriden. By default, is
   * calculated every time getCollisionShape is called.
   */
  /** @type {CollisionShape} */
  collisionShape;

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
    this.collisionType = "Circle";
  }

  /**
   * Set the collision shape of the entity. Give no arguments to reset the shape
   * to be calculated each call of getCollisonShape
   * @param {CollisionShape} [collisionShape]
   * @returns {void}
   */
  setCollisionShape(collisionShape) {
    this.collisionShape = collisionShape;
  }
  /**
   * Set the collision shape of the entity when colliding with terrain. Give no
   * arguments to reset the shape to be the same as collisionShape
   * @returns {void}
   */
  setTerrainCollisionShape(terrainCollisionShape) {
    this.terrainCollisionShape = terrainCollisionShape;
  }

  /**
   * Returns the collision shape of the entity.
   * If the entity has a collisionEntity property, that shape is updated to the
   * current position and is returned. Otherwise, a new CollisionShape is
   * calculated.
   * @returns {CollisionShape}
   */
  getCollisionShape() {
    if (this.collisionShape !== undefined) {
      this.collisionShape.pos = this.pos;
      this.collisionShape.vel = this.vel;
      return this.collisionShape;
    } else if (this.collisionType == "Box") {
      return new CollisionBox(this.width, this.height, this.pos, this.vel);
    } else if (this.collisionType == "Circle") {
      return new CollisionCircle(
        Math.min(this.width, this.height) / 2,
        this.pos,
        this.vel
      );
    } else if (this.collisionType === "Beam") {
      // this is a bad implementation and should be overridden
      return new CollisionBeam(
        this.pos,
        this.pos.add(this.vel.norm2().mult(Math.min(this.width, this.height))),
        Math.max(this.width, this.height)
      );
    }
    return new CollisionShape(undefined, this.pos, this.vel);
  }

  /**
   * Returns the terrain collision shape of the entity.
   * If the entity has a collisionEntity property, that shape is updated to the
   * current position and returned. Otherwise, the collisionShape is returned.
   * @returns {CollisionShape}
   */
  getTerrainCollisionShape() {
    if (this.terrainCollisionShape !== undefined) {
      this.terrainCollisionShape.pos = this.pos;
      this.terrainCollisionShape.vel = this.vel;
      return this.terrainCollisionShape;
    }
    return this.getCollisionShape();
  }

  onScreen() {
    const { width: screenWidth, height: screenHeight } = getScreenDimensions();
    const screenBox = new CollisionBox(
      screenWidth,
      screenHeight,
      new Vector(screenWidth / 2, screenHeight / 2).add(
        getCameraOffset().mult(-1)
      )
    );
    return !collide(this.getCollisionShape(), screenBox).isZeroVec();
  }

  /**
   * draws the entity
   */
  draw() {}

  /**
   * steps the entity using position, velocity, acceleration and drag
   */
  step() {
    if (this.acc.mag() > this.maxAccMag)
      this.acc = this.acc.norm2().mult(this.maxAccMag);
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
   * @param {Vector} pos
   */
  collideWithBlock(pos) {}
}
