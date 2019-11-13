import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { randomFromEnum, randomInt, hsl } from "../modules/helpers.js";
import { drawCircle, outlineCircle, centeredOutlineRect } from "./draw.js";
import { getContext } from "../modules/gamemanager.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

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
    color: hsl(randomInt(360)),
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
    this.type = "enemy";
    this.width = 50;
    this.height = 50;
    this.bounciness = 1;
    this.drag = 0.005;
  }

  action() {
    // TODO change this
    if (Math.random() < 0.01) {
      const randomDir = Math.random() * 2 * Math.PI;
      const acc = new Vector(
        Math.cos(randomDir) * 0.1,
        Math.sin(randomDir) * 0.1
      );
      this.acc = acc;
    }
  }

  draw() {
    // TODO get rid of magic numbers

    // draw the body
    if (this.look.shape === ShapeEnum.circle) {
      outlineCircle(this.drawPos, 25, 4, this.look.color, "white");
    } else {
      centeredOutlineRect(
        this.drawPos,
        this.width,
        this.height,
        4,
        this.look.color,
        "white"
      );
    }

    // draw the eyes
    outlineCircle(
      this.drawPos.add(new Vector(this.look.eyeSpacing, 0)),
      this.look.eyeSize,
      2,
      "white"
    );
    outlineCircle(
      this.drawPos.sub(new Vector(this.look.eyeSpacing, 0)),
      this.look.eyeSize,
      2,
      "white"
    );

    // draw the mouth
    const context = getContext();
    context.strokeStyle = "white";
    context.lineWidth = 3;
    context.beginPath();
    const mouthHalf = this.look.mouthWidth / 2;
    context.moveTo(
      this.drawPos.x + mouthHalf,
      this.drawPos.y + this.look.mouthOffset
    );
    context.lineTo(
      this.drawPos.x - mouthHalf,
      this.drawPos.y + this.look.mouthOffset
    );
    context.stroke();
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
