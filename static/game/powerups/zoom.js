import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

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
   * @param {Creature} creature 
   * @override
   */
  applyToHero(creature) {
    super.apply(creature);
    creature.drag -= this.magnitude * 0.05;
  }
}