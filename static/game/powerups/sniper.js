import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_LIFETIME = 500;
const RANGE_FACTOR = 5;

export class Sniper extends PowerUp {
  /**
   * Increases your range (by increasing bullet lifetime)
   * @param {Vector} pos
   * @param {number} magnitude how much this increases your range by, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Sniper");
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
    // creature is just too big
    if (creature.bulletLifetime >= MAX_BULLET_LIFETIME) {
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
