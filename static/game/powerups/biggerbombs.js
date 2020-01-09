import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BLAST_RADIUS = 1000;
const BLAST_RADIUS_FACTOR = 30;

export class BiggerBombs extends PowerUp {
  /**
   * Makes your bombs bigger
   * @param {Vector} pos
   * @param {number} magnitude how much bigger your bombs get, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Bigger Bombs");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bombBlastRadius += this.magnitude * BLAST_RADIUS_FACTOR;
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
    if (creature.bombBlastRadius >= MAX_BLAST_RADIUS) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BLAST_RADIUS - creature.bombBlastRadius) / BLAST_RADIUS_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
