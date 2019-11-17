import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { centeredOutlineCircle } from "./draw.js";

export class Bullet extends Entity {
  /**
   * constructs a new bullet
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {boolean} good
   */
  constructor(pos, vel, acc = new Vector(0, 0), good) {
    super(pos, vel, acc);
    this.good = good;
    good ? (this.type = "PlayerBullet") : (this.type = "EnemyBullet");
  }

  draw() {
    centeredOutlineCircle(this.drawPos, 12, 4, "white", "black");
  }
}
