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

const noisy = false;

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
    // TODO: get this from some sort of settings
    const debugDraw = false;

    if (debugDraw) {
      const { width: bWidth, height: bHeight } = getDimensions();
      let entityCell = new Vector(
        Math.floor(this.pos.x / bWidth),
        Math.floor(this.pos.y / bHeight)
      );

      // TODO update this debug drawing
      // Draw cubes around the enemy
      for (let i = entityCell.x - 1; i <= entityCell.x + 1; i++) {
        for (let j = entityCell.y - 1; j <= entityCell.y + 1; j++) {
          let color = "rgba(0, 255, 0, 0.5)";
          if (solidAt(i, j)) {
            color = "rgba(0, 0, 255, 0.5)";
            let x = (i + 1) * bWidth - bWidth / 2;
            let y = (j + 1) * bHeight - bHeight / 2;
            let e = new Entity(new Vector(x, y));
            e.width = bWidth;
            e.height = bHeight;

            if (isColliding(this, e)) color = "rgba(255, 0, 0, 0.5)";

            centeredOutlineRectFill(
              new Vector(
                (i + 1) * bWidth - bWidth / 2,
                (j + 1) * bHeight - bHeight / 2
              ),
              bWidth,
              bHeight,
              4,
              color,
              "white"
            );
          }
        }
      }
    }

    // TODO get rid of magic numbers in regular drawing
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

    /**
     * draw a single eye
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawEye = scalar => {
      centeredOutlineCircle(
        this.drawPos.add(new Vector(scalar * this.look.eyeSpacing, 0)),
        this.look.eyeSize,
        4,
        this.look.color,
        "black"
      );
    };

    // draw the eyes
    drawEye(1);
    drawEye(-1);

    const context = getContext();

    // draw the mouth
    const mouthHalf = this.look.mouthWidth / 2;

    drawLine(
      new Vector(
        this.drawPos.x + mouthHalf,
        this.drawPos.y + this.look.mouthOffset
      ),
      new Vector(
        this.drawPos.x - mouthHalf,
        this.drawPos.y + this.look.mouthOffset
      ),
      this.look.color,
      4
    );

    context.stroke();

    if (debugDraw) {
      context.beginPath();
      context.strokeStyle = "red";
      context.lineWidth = 10;
      context.moveTo(this.drawPos.x, this.drawPos.y);
      context.lineTo(
        this.drawPos.x + this.acc.x * 500,
        this.drawPos.y + this.acc.y * 500
      );
      context.stroke();
      context.beginPath();
      context.strokeStyle = "yellow";
      context.lineWidth = 10;
      context.moveTo(this.drawPos.x, this.drawPos.y);
      context.lineTo(
        this.drawPos.x + this.vel.x * 50,
        this.drawPos.y + this.vel.y * 50
      );
      context.stroke();
    }
  }

  destroy() {
    for (let i = 0; i < 30; i++) {
      addParticle(new Particle(this.pos, this.look.color, EffectEnum.spark));
    }
    if (noisy) {
      console.log("i got destroyed");
    }
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
