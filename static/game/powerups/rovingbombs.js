import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BOMB_SPEED = 20;
const BOMB_SPEED_FACTOR = 1;

export class RovingBombs extends PowerUp {
  /**
   * Makes your bombs move after being placed
   * @param {Vector} pos
   * @param {number} magnitude how fast the bombs will move you become, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Roving Bombs");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bombSpeed += this.magnitude * BOMB_SPEED_FACTOR;
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
    // check if bombSpeed is already too high
    if (creature.wallReflectSpeed >= MAX_BOMB_SPEED) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_BOMB_SPEED - creature.wallReflectSpeed) / BOMB_SPEED_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
