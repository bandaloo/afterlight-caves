import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { drawShines, centeredOutlineCircle } from "./draw.js";
import { randomInt } from "../modules/helpers.js";

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
 * @typedef {Object} Stats
 * @property {number} movementSpeed
 * @property {number} shotSpeed
 * @property {number} accuracy
 * @property {number} rateOfFire
 */

export class Boss extends Enemy {
  followDistace = 500;
  following = false;
  followTimer = 0;
  followTimerMax = 200;

  /**
   * @param {Vector} pos
   * @param {Look} look
   * @param {Stats} stats
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {{size: number, speed: number, explode: number}} modifiers
   */
  constructor(pos, look, stats, vel, acc, modifiers) {
    super(pos, look, stats, vel, acc, modifiers);
    this.drag = 0.015;
    this.maxHealth = 10;
    this.gainHealth(10);
    this.shines = new Array(30);
    for (let i = 0; i < 30; ++i) {
      this.shines[i] = {
        angle: Math.random() * 2 * Math.PI,
        width: 0.3 + Math.random() * 0.2,
        length: this.width * 0.3 + Math.floor(this.width / 2),
        speed: 0.01 + Math.random() * 0.01,
        hue: (340 + randomInt(40)) % 360
      };
    }
  }

  /**
   * Chases the player
   * @override
   */
  action() {
    super.action();
    // TODO probably add more complex AI
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      // TODO make vector to helper function in entity
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.followTimer >= 0 || dirVec.magnitude() < this.followDistace) {
        this.followTimer--;
        this.following = true;
        this.acc = dirVec
          .norm2()
          .mult(0.15)
          .mult(this.movementMultiplier);
      } else {
        this.following = false;
        this.acc = new Vector(0, 0);
      }
    }
  }

  /**
   * @override
   */
  drawBody() {
    // TODO implement
  }

  /**
   * @override
   */
  drawFace() {
    // TODO implement
    centeredOutlineCircle(
      this.drawPos,
      this.width / 2,
      4,
      this.look.color,
      "black"
    );
  }

  draw() {
    // draw shines
    drawShines(this.drawPos, this.shines);
    // rotate shines
    for (const s of this.shines) {
      s.angle += s.speed;
      s.hue += 1;
      s.hue %= 360;
      if (s.angle >= 2 * Math.PI) s.angle -= 2 * Math.PI;
    }
    super.draw();
  }
}
