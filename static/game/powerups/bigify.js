import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Entity } from "../../modules/entity.js";

export class Bigify extends PowerUp {
  /**
   * Makes you bigger
   * @param {Vector} pos
   * @param {number} magnitude how big this makes you, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "Bigify " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Entity} entity
   * @override
   */
  apply(entity) {
    super.apply(entity);
    entity.width += this.magnitude * 20;
    entity.height += this.magnitude * 20;
  }
}