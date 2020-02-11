import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MIN_SIZE = 20;
const SIZE_FACTOR = 5;

export class Littlify extends PowerUp {
  /**
   * Makes you smaller
   * @param {number} magnitude how much smaller this makes you, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Littlify", "Makes you smaller");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.width -= this.magnitude * SIZE_FACTOR;
      creature.height -= this.magnitude * SIZE_FACTOR;
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
    if (creature.width <= MIN_SIZE || creature.height <= MIN_SIZE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MIN_SIZE - creature.width) / SIZE_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
