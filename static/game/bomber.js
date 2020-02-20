import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { Orb } from "./powerups/orb.js";
import { randomNormalVec, randomInt } from "../modules/helpers.js";

export class Bomber extends Enemy {
  /**
   * constructs a bomber enemy
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   */
  constructor(pos, vel, acc, matryoshka) {
    super(pos, vel, acc, matryoshka);
    this.baseHealth = 15;
    this.initHealth();
    new Orb(3 + randomInt(3)).apply(this);
    this.maxChargeCounter = 150;
    this.chargeCounter = 0;
    this.drag = 0.015;
    this.maxBombs = Infinity;
    this.setBombDamage(10);
    this.addBombs(Infinity);
    this.bulletSpeed = 5;
    this.bombBlastRadius = 200;
  }

  action() {
    this.chargeCounter++;
    this.chargeCounter %= this.maxChargeCounter;
    if (this.chargeCounter === 0) {
      this.vel = randomNormalVec().mult(5);
      this.placeBomb(this.pos);
    }
    super.action();
  }

  drawBody() {
    const chargeScalar = this.width * 0.2;
    /** @param {number} x */
    const shape = x => (2 * (x - 0.5)) ** 4;
    for (let i = 0; i < 2; i++)
      circle(
        this.drawPos,
        this.width / 2 +
          i * chargeScalar * shape(this.chargeCounter / this.maxChargeCounter),
        this.getBackgroundColor(),
        5,
        this.drawColor
      );
  }
}
