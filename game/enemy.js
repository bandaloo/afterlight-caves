import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";

/**
 * an enum for allowed shapes of enemies
 * @enum {number}
 */
const ShapeEnum = Object.freeze({ square: 1, circle: 2 });

export class Enemy extends Entity {
  /** @type {number} */
  movementSpeed;

  /** @type {number} */
  shotSpeed;

  /** @type {number} */
  accuracy;

  /** @type {number} */
  rateOfFire;

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

  toString() {
    return `movement speed: ${this.movementSpeed}
    shot speed: ${this.shotSpeed}
    accuracy: ${this.accuracy}
    rate of fire: ${this.rateOfFire}`;
  }
}
