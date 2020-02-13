import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_RIGHT_DAMAGE = 1000;
const DAMAGE_FACTOR = 5;
const SIZE_FACTOR = 2;

export class Right extends PowerUp {
  /**
   * Makes your right-facing shots more powerful
   * @param {number} magnitude how much smaller this makes you, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Right", "Deal more damage when shooting right");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.rightBulletDamage += this.magnitude * DAMAGE_FACTOR;
      creature.rightBulletSize += this.magnitude * SIZE_FACTOR;
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
    if (creature.rightBulletDamage >= MAX_RIGHT_DAMAGE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_RIGHT_DAMAGE - creature.rightBulletDamage) / DAMAGE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
