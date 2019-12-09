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
  addParticle,
  addToWorld
} from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";

const noisy = false;
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
  health = 2;
  modifiers = {
    size: 0,
    speed: 0,
    explode: 0
  };

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Look} look
   * @param {Stats} stats
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {Object} modifiers
   */
  constructor(
    pos,
    look,
    stats,
    vel = new Vector(0, 0),
    acc = new Vector(0, 0),
    modifiers = { size: 0, speed: 0, explode: 0 }
  ) {
    super(pos, vel, acc);
    this.look = look;
    this.stats = stats;
    this.type = "Enemy";
    this.modifiers = modifiers;
    this.width = 50 + 50 * this.modifiers.size;
    this.height = 50 + 50 * this.modifiers.size;
    this.bounciness = 1;
    this.drag = 0.005;

    // what to do when colliding with other entities
    this.collideMap.set("PlayerBullet", entity => {
      this.hit(entity);
    });
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      let p = new Particle(this.pos, this.look.color, EffectEnum.spark);
      p.width = 5;
      addParticle(p);
    }

    if (this.modifiers.size > 0) {
      const newModifiers = Object.assign({}, this.modifiers);
      newModifiers.size--;
      let randDir = Math.random() * 2 * Math.PI;
      const spawnNum = 3;
      const pushSpeed = 5;
      for (let i = 0; i < spawnNum; i++) {
        const childEnemy = new (Object.getPrototypeOf(this).constructor)(
          this.pos,
          this.look,
          this.stats,
          new Vector(
            Math.cos(randDir) * pushSpeed,
            Math.sin(randDir) * pushSpeed
          ),
          new Vector(0, 0),
          newModifiers
        );
        addToWorld(childEnemy);
        randDir += (2 * Math.PI) / spawnNum;
      }
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

  /**
   * what to do when being hit by a bullet
   * @param {Entity} entity
   */
  hit(entity) {
    this.vel = this.vel.add(entity.vel.mult(0.7));
    this.health--;
    if (this.health <= 0) {
      this.deleteMe = true;
    }
    entity.deleteMe = true;
  }
}
