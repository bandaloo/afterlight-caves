import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

export class Damage extends PowerUp {
  /**
   * Increases your fire rate
   * @param {Vector} pos
   * @param {number} magnitude how much to increase fire rate, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "Damage " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    super.apply(creature);
    creature.bulletDamage += this.magnitude * 0.05;
  }
}
