import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { randomFromEnum, randomInt, hsl } from "../modules/helpers.js";
import {
  centeredOutlineRect,
  centeredOutlineRectFill,
  centeredOutlineCircle,
  drawLine
} from "./draw.js";
import {
  getContext,
  getDimensions,
  addParticle
} from "../modules/gamemanager.js";
import { solidAt, isColliding } from "../modules/collision.js";
import { Particle, EffectEnum } from "./particle.js";
/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
export const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

// TODO figure out how to put shape enum in the jsdoc

/**
 * @typedef {Object} Look
 * @property {number} shape
 * @property {string} color
 * @property {number} eyeSpacing
 * @property {number} eyeSize
 * @property {number} mouthWidth
 * @property {number} mouthOffset
 */

/**
 * @returns {Look}
 */
export function randomLook() {
  return {
    shape: randomFromEnum(ShapeEnum),
    color: hsl(randomInt(360), 100, 70),
    eyeSpacing: 10 + randomInt(10),
    eyeSize: 5 + randomInt(3),
    mouthWidth: 20 + randomInt(25),
    mouthOffset: 10 + randomInt(6)
  };
}

/**
 * @typedef {Object} Stats
 * @property {number} movementSpeed
 * @property {number} shotSpeed
 * @property {number} accuracy
 * @property {number} rateOfFire
 */

/**
 * returns random stats for an enemy of given difficulty
 * @param {number} difficulty
 * @return {Stats}
 */
export function randomStats(difficulty) {
  let stats = {
    movementSpeed: 0,
    shotSpeed: 0,
    accuracy: 0,
    rateOfFire: 0
  };

  for (let i = 0; i < difficulty; i++) {
    let num = Math.random();
    if (num < 0.25) {
      stats.movementSpeed++;
    } else if (num < 0.5) {
      stats.shotSpeed++;
    } else if (num < 0.75) {
      stats.accuracy++;
    } else {
      stats.rateOfFire++;
    }
  }

  return stats;
}

export class Enemy extends Entity {
  health = 3;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Look} look
   * @param {Stats} stats
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(
    pos,
    look,
    stats,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0)
  ) {
    super(pos, vel, acc);
    this.look = look;
    this.stats = stats;
    this.type = "Enemy";
    this.width = 50;
    this.height = 50;
    this.bounciness = 1;
    this.drag = 0.005;

    // what to do when colliding with other entities
    // TODO don't make this an anonymous function (make it part of prototype so
    // it's not repeated)
    this.collideMap.set("PlayerBullet", entity => {
      this.vel = this.vel.add(entity.vel.mult(0.7));
      this.health--;
      if (this.health <= 0) {
        this.deleteMe = true;
      }
      entity.deleteMe = true;
    });
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      addParticle(new Particle(this.pos, this.look.color, EffectEnum.spark));
    }
  }

  drawBody() {
    // draw the body
    if (this.look.shape === ShapeEnum.circle) {
      centeredOutlineCircle(
        this.drawPos,
        this.width / 2,
        4,
        this.look.color,
        "black"
      );
    } else {
      centeredOutlineRect(
        this.drawPos,
        this.width,
        this.height,
        4,
        this.look.color,
        "black"
      );
    }
  }

  /** @abstract */
  drawFace() {}

  draw() {
    this.drawBody();
    this.drawFace();
  }

  toString() {
    return (
      `movement speed: ${this.stats.movementSpeed} ` +
      `shot speed: ${this.stats.shotSpeed} ` +
      `accuracy: ${this.stats.accuracy} ` +
      `rate of fire: ${this.stats.rateOfFire}`
    );
  }
}
