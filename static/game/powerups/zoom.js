import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
const MOVEMENT_FACTOR = 1 / 5;
const MAX_MOVEMENT_MULTIPLIER = 4;

export class Zoom extends PowerUp {
  /**
   * Makes you faster
   * @param {number} magnitude how much faster this makes you, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Zoom", "Makes your faster");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.movementMultiplier += this.magnitude * MOVEMENT_FACTOR;
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
    // check if bulletRubberiness is already too high
    if (creature.movementMultiplier >= MAX_MOVEMENT_MULTIPLIER) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(
        (MAX_MOVEMENT_MULTIPLIER - creature.movementMultiplier) /
          MOVEMENT_FACTOR
      )
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
