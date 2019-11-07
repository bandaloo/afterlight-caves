import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import {
  randomFromEnum,
  randomInt,
  hsl,
  drawCircle
} from "../modules/helpers.js";
import { getCanvas, getContext } from "../modules/gamemanager.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

export class Enemy extends Entity {
  /** @type {number} */
  movementSpeed = 0;

  /** @type {number} */
  shotSpeed = 0;

  /** @type {number} */
  accuracy = 0;

  /** @type {number} */
  rateOfFire = 0;

  /** @type {string} */
  color;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {number} difficulty determines how many stats this can get
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, difficulty, vel = new Vector(0, 0), acc = new Vector(0, 0)) {
    super(pos, vel, acc);
    this.type = "enemy";
    for (let i = 0; i < difficulty; i++) {
      this.randomLevelUp();
    }
    this.shape = randomFromEnum(ShapeEnum);
    this.randomHslColor();
    console.log("shape: " + this.shape);
    console.log(this.toString());
  }

  /**
   * randomly put a skill point into this enemy
   */
  randomLevelUp() {
    let num = Math.random();
    if (num < 0.25) {
      this.movementSpeed++;
    } else if (num < 0.5) {
      this.shotSpeed++;
    } else if (num < 0.75) {
      this.accuracy++;
    } else {
      this.rateOfFire++;
    }
  }

  draw() {
    drawCircle(this.pos, 20, this.color);
  }

  /**
   * give the enemy a random hsl color
   */
  randomHslColor() {
    this.color = hsl(randomInt(360));
  }

  toString() {
    return (
      `movement speed: ${this.movementSpeed}\n` +
      `shot speed: ${this.shotSpeed}\n` +
      `accuracy: ${this.accuracy}\n` +
      `rate of fire: ${this.rateOfFire}\n`
    );
  }
}
