import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

export class Elastic extends PowerUp {
  /**
   * Makes you bigger
   * @param {Vector} pos
   * @param {number} magnitude how bouncy your bullets are, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Elastic");
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
    creature.bulletBounciness = 1;
    creature.bulletRubberiness =
      creature.bulletRubberiness + this.magnitude / 3;
    return true;
  }
}
