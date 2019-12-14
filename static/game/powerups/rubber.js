import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_RUBBERINESS = 5;
const RUBBER_FACTOR = 1 / 3;

export class Rubber extends PowerUp {
  /**
   * Makes you bouncy
   * @param {Vector} pos
   * @param {number} magnitude how bouncy you become, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Rubber");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bounciness = 1;
      creature.rubberiness += this.magnitude * RUBBER_FACTOR;
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
    if (creature.rubberiness >= MAX_RUBBERINESS) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_RUBBERINESS - creature.bulletRubberiness) / RUBBER_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
