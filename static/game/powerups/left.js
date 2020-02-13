import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_LEFT_DAMAGE = 1000;
const DAMAGE_FACTOR = 5;
const SIZE_FACTOR = 2;

export class Left extends PowerUp {
  /**
   * Makes your left-facing shots more powerful
   * @param {number} magnitude how much smaller this makes you, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Left", "Deal more damage when shooting left");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.leftBulletDamage += this.magnitude * DAMAGE_FACTOR;
      creature.leftBulletSize += this.magnitude * SIZE_FACTOR;
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
    if (creature.leftBulletDamage >= MAX_LEFT_DAMAGE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_LEFT_DAMAGE - creature.leftBulletDamage) / DAMAGE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
