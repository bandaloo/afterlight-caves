import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Entity } from "../../modules/entity.js";

export class Elastic extends PowerUp {
  /**
   * Makes you bigger
   * @param {Vector} pos
   * @param {number} magnitude how bouncy your bullets are, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "Elastic " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Entity} entity
   * @override
   */
  apply(entity) {
    super.apply(entity);
    entity.bulletBounciness = 1;
    entity.bulletRubberiness += this.magnitude;
  }
}