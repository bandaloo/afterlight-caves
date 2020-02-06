import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MIN_FIRE_DELAY = 2;
const FIRE_DELAY_FACTOR = 1;

export class MachineGun extends PowerUp {
  /**
   * Increases your fire rate
   * @param {number} magnitude how much to increase fire rate, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(
      pos,
      magnitude,
      "Machine Gun",
      "You can fire more bullets per second"
    );
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.fireDelay -= this.magnitude * FIRE_DELAY_FACTOR;
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
    // check if fireDelay is already too low
    if (creature.fireDelay <= MIN_FIRE_DELAY) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MIN_FIRE_DELAY - creature.fireDelay) / FIRE_DELAY_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
