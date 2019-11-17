import { Entity } from "../modules/entity.js";
import { randomInt, randomNormalVec } from "../modules/helpers.js";
import { centeredOutlineRect } from "./draw.js";
import { Vector } from "../modules/vector.js";

export class SquareParticle extends Entity {
  /**
   * constructs a square particle
   * @param {Vector} pos
   * @param {string} style
   * @param {Vector} [acc]
   */
  constructor(
    pos,
    style,
    baseSpeed = 10,
    randSpeed = 3,
    drag = 0.08,
    baseLifetime = 20,
    randLifetime = 30,
    acc = new Vector(0, 0)
  ) {
    const vel = randomNormalVec().mult(baseSpeed + randSpeed * Math.random());
    super(pos, vel, acc);
    this.vel = vel;
    this.lifetime = baseLifetime + randomInt(randLifetime);
    this.width = 16;
    this.height = 16;
    this.style = style;
    this.drag = drag;
  }

  draw() {
    centeredOutlineRect(
      this.drawPos,
      this.width,
      this.height,
      1,
      "white",
      this.style
    );
  }
}
