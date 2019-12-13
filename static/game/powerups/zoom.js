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
    super(pos, magnitude, "Zoom");
  }

  /**
   * applies this powerup to the hero
   * @param {Creature} creature
   * @override
   * @returns {Boolean}
   */
  applyToHero(creature) {
    if (!super.apply(creature)) {
      super.overflowAction(creature);
      return false;
    }
    creature.movementMultiplier *= 1.25;
    creature.drag *= 0.5;
    return true;
  }
}
