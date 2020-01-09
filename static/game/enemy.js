import { Entity, FarEnum } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { randomFromEnum, randomInt, hsl } from "../modules/helpers.js";
import { Creature } from "./creature.js";
import {
  centeredOutlineRect,
  centeredOutlineCircle,
  drawLine
} from "./draw.js";
import { addParticle, addToWorld } from "../modules/gamemanager.js";
import { Particle, EffectEnum } from "./particle.js";
import { Bullet } from "./bullet.js";

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

export class Enemy extends Creature {
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
   * @param {{size: number, speed: number, explode: number}} modifiers
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
    this.touchDamage = 1;
    this.maxRedFrames = 60;
    this.redFrames = 0;
    this.drawColor = this.look.color;

    this.farType = FarEnum.deactivate;

    this.collideMap.set(
      "Hero",
      /** @param {import("./hero.js").Hero} h */ h => {
        h.takeDamage(this.touchDamage);
      }
    );
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      let p = new Particle(this.pos, this.look.color, EffectEnum.spark);
      p.lineWidth = 5;
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
    const bgColor = this.redFrames === 0 ? "black" : "rgba(255, 69, 0, 0.3)";
    if (this.look.shape === ShapeEnum.circle) {
      centeredOutlineCircle(
        this.drawPos,
        this.width / 2,
        4,
        this.drawColor,
        bgColor
      );
    } else {
      centeredOutlineRect(
        this.drawPos,
        this.width,
        this.height,
        4,
        this.drawColor,
        bgColor
      );
    }
  }

  /** @abstract */
  drawFace() {}

  draw() {
    this.drawBody();
    this.drawFace();
    super.draw();
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
   * @override
   * @param {number} amt amount of damage to take
   */
  takeDamage(amt) {
    this.redFrames = this.maxRedFrames;
    this.drawColor = "orangered";
    super.takeDamage(amt);
  }

  /**
   * @override
   */
  action() {
    if (this.redFrames > 0) {
      if (this.redFrames === 1) this.drawColor = this.look.color;
      this.redFrames--;
    }
    super.action();
  }
}
