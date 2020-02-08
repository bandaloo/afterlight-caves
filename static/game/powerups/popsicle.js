import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bomb } from "../bomb.js";
import { Frozen } from "../statuseffects/frozen.js";

const FROZEN_LENGTH_FACTOR = 1;

export class Popsicle extends PowerUp {
  /**
   * Your bombs freeze enemies
   * @param {number} magnitude how long the enemies are frozen for
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Popsicle", "Your bombs freeze enemies");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bombHue = 203;
      /**
       * @param {Bomb} b the bomb this came from
       * @param {number} [duration] the duration for frozen to last, in seconds
       * @param {Creature} other the creature we hit
       */
      const f = (b, duration = 1, other) => {
        new Frozen(duration * FROZEN_LENGTH_FACTOR * 60).apply(other);
      };

      creature.bombOnBlastCreature.push({
        name: this.powerUpClass,
        data: this.magnitude,
        func: f
      });
    } else {
      super.overflowAction(creature);
    }
  }

  /**
   * returns true if the creature is at the max level for this powerup.
   * trims magnitude it if would push the creature over the limit
   * @param {Creature} creature
   * @override
   */
  isAtMax(creature) {
    // For now I don't think it's possible to have too much popsicle
    return false;
  }
}
