import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

export class Bigify extends PowerUp {
  /**
   * Makes you bigger
   * @param {Vector} pos
   * @param {number} magnitude how big this makes you, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Bigify");
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
    creature.width += this.magnitude * 5;
    creature.height += this.magnitude * 5;
    return true;
  }
}
