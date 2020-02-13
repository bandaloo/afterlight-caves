import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_LIFETIME = 500;
const RANGE_FACTOR = 5;

export class Yeet extends PowerUp {
  /**
   * Increases your range (by increasing bullet lifetime)
   * @param {number} magnitude how much to increase bullet lifetime by, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Yeet", "You can shoot farther");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletLifetime += this.magnitude * RANGE_FACTOR;
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
    // check if bullet knockback is already too high
    if (creature.bulletKnockback >= MAX_BULLET_LIFETIME) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_BULLET_LIFETIME - creature.bulletLifetime) / RANGE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
