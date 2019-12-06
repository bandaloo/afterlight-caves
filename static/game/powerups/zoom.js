import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Entity } from "../../modules/entity.js";

export class Zoom extends PowerUp {

  /**
   * Makes you faster
   * @param {Vector} pos
   * @param {number} magnitude how much faster this makes you, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "Zoom " + this.magnitude;
  }

  /**
   * applies this powerup to the hero
   * @param {Entity} entity 
   * @override
   */
  applyToHero(entity) {
    super.apply(entity);
    entity.drag -= this.magnitude * 0.005;
  }
}