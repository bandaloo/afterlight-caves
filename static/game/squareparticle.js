import { Entity } from "../modules/entity.js";
import { randomInt, randomNormalVec } from "../modules/helpers.js";
import { centeredOutlineRect } from "./draw.js";
import { Vector } from "../modules/vector.js";

export class SquareParticle extends Entity {
  /**
   * constructs a square particle
   * @param {Vector} pos
   * @param {string} style
   * @param {Vector} [vel]
   * @param {Vector} [acc]
   */
  constructor(
    pos,
    style,
    vel = randomNormalVec().mult(10 + 3 * Math.random()),
    acc
  ) {
    super(pos, vel, acc);
    this.lifetime = 20 + randomInt(30);
    this.width = 16;
    this.height = 16;
    this.style = style;
    this.drag = 0.08;
  }

  draw() {
    centeredOutlineRect(
      this.drawPos,
      this.width,
      this.height,
      3,
      "white",
      this.style
    );
  }
}
