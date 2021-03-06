import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_DAMAGE = 1000;
const DAMAGE_FACTOR = 5;

export class DamageUp extends PowerUp {
  /**
   * Increases your damage
   * @param {number} magnitude how much to increase damage, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Damage Up", "Increases your bullet damage");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletDamage += this.magnitude * DAMAGE_FACTOR;
    } else {
      this.overflowAction(creature);
    }
  }

  /**
   * returns true if the creature is at the max level for this powerup.
   * trims magnitude it if would push the creature over the limit
   * @param {Creature} creature
   * @override
   */
  isAtMax(creature) {
    // creature bullet damage is already at or over the limit
    if (creature.bulletDamage >= MAX_DAMAGE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_DAMAGE - creature.bulletDamage) / DAMAGE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
