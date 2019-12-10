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
    super(pos, magnitude);
    this.powerUpName = "Bigify " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    super.apply(creature);
    creature.width += this.magnitude * 20;
    creature.height += this.magnitude * 20;
  }
}