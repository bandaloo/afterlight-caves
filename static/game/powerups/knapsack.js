import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const KNAPSACK_FACTOR = 1;

export class Knapsack extends PowerUp {
  /**
   * Increases your max bombs
   * @param {number} magnitude how much this increases you max bombs by, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(pos, magnitude, "Knapsack", "You can carry more bombs");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.maxBombs += this.magnitude * KNAPSACK_FACTOR;
      creature.addBombs(this.magnitude * KNAPSACK_FACTOR);
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
    // I don't think it's possible to have too many max bombs
    return false;
  }
}
