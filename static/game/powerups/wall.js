import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const DEFENSE_FACTOR = 0.1;
const DRAG_FACTOR = 0.005;
const MAX_DRAG = 0.5;

export class Wall extends PowerUp {
  /**
   * Increases your defense, but makes you slightly slower
   * @param {number} magnitude how much this increases your defense by, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(pos, magnitude, "Wall", "Increases your defense");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.defense += this.magnitude * DEFENSE_FACTOR;
      creature.drag = Math.min(
        creature.drag + (this.magnitude * DRAG_FACTOR),
        MAX_DRAG
      );
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
    // because defense already has diminishing returns at higher valuse
    // (percentage of damage reduced approaches 100), I don't think it's
    // possible to have too high a defense
    return false;
  }
}
