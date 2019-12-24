import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_SIZE = 300;
const BULLET_SIZE_FACTOR = 1;

export class Amplify extends PowerUp {
  /**
   * Increases the size of your bullets
   * @param {Vector} pos
   * @param {number} magnitude how much to increase bullet size, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Amplify");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletSize += this.magnitude * BULLET_SIZE_FACTOR;
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
    if (creature.bulletSize >= MAX_BULLET_SIZE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BULLET_SIZE - creature.bulletSize) / BULLET_SIZE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
