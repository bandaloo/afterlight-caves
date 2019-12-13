import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

export class Rubber extends PowerUp {
  /**
   * Makes you bouncy
   * @param {Vector} pos
   * @param {number} magnitude how bouncy you become, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Rubber");
    this.powerUpName = this.powerUpClass + " " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   * @returns {Boolean}
   */
  apply(creature) {
    if (!super.apply(creature)) {
      super.overflowAction(creature);
      return false;
    }
    creature.bounciness = 1;
    creature.rubberiness += this.magnitude;
    return true;
  }
}
