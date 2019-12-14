import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_RUBBERINESS = 5;
const ELASTICITY_FACTOR = 1 / 3;

export class Elastic extends PowerUp {
  /**
   * Makes your bullets bouncy
   * @param {Vector} pos
   * @param {number} magnitude how bouncy your bullets are, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Elastic");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletBounciness = 1;
      creature.bulletRubberiness += this.magnitude * ELASTICITY_FACTOR;
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
    if (creature.bulletRubberiness >= MAX_BULLET_RUBBERINESS) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BULLET_RUBBERINESS - creature.bulletRubberiness) / ELASTICITY_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
