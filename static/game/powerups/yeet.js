import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_KNOCKBACK = 40;
const BULLET_KNOCKBACK_FACTOR = 4;

export class Yeet extends PowerUp {
  /**
   * Increases bullet knockback
   * @param {Vector} pos
   * @param {number} magnitude how much to increase bullet knockback by, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Yeet");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletKnockback += this.magnitude * BULLET_KNOCKBACK_FACTOR;
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
    if (creature.bulletKnockback >= MAX_BULLET_KNOCKBACK) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BULLET_KNOCKBACK - creature.bulletKnockback) /
        BULLET_KNOCKBACK_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
