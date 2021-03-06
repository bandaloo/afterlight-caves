import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_SPEED = 24;
const BULLET_SPEED_FACTOR = 1;

export class QuickShot extends PowerUp {
  /**
   * Increases the speed of your bullets
   * @param {number} magnitude how much this increases your bullet speed by, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Quick Shot", "Makes your bullets faster");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletSpeed += this.magnitude * BULLET_SPEED_FACTOR;
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
    if (creature.bulletSpeed >= MAX_BULLET_SPEED) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_BULLET_SPEED - creature.bulletSpeed) / BULLET_SPEED_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
