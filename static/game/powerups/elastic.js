import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const maxRubberiness = 15;

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
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    super.apply(creature);
    creature.bulletBounciness = 1;
    creature.bulletRubberiness = Math.min(
      creature.bulletRubberiness + this.magnitude / 3,
      maxRubberiness
    );
  }
}
