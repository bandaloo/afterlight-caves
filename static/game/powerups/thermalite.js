import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MIN_FUSE_TIME = 30;
const FUSE_TIME_FACTOR = 20;

export class Thermalite extends PowerUp {
  /**
   * Decreases the fuse time of your bombs
   * @param {number} magnitude how much to decrease fuse time by, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(pos, magnitude, "Thermalite", "Makes your bombs explode sooner");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bombFuseTime -= this.magnitude * FUSE_TIME_FACTOR;
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
    // creature bomb fuse time is already under the limit
    if (creature.bombFuseTime <= MIN_FUSE_TIME) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MIN_FUSE_TIME - creature.bombFuseTime) / FUSE_TIME_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
