import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bullet } from "../bullet.js";
import { Burning } from "../statuseffects/burning.js";

const BURNING_LENGTH_FACTOR = 1;

export class FlameThrower extends PowerUp {
  /**
   * Your bullets set enemies on fire
   * @param {Vector} pos
   * @param {number} magnitude how long the enemies burn for
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Flamethrower");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      /**
       * @param {Bullet} b the bullet this spawned
       * @param {number} [duration] the duration for burning to last, in seconds
       * @param {Creature} other the creature we hit
       */
      const f = (b, duration = 1, other) => {
        other.statusEffects.push(new Burning(duration * 60));
      };

      creature.bulletOnHitEnemy.push({
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
    // For now I don't think it's possible to have too much flamethrower
    return false;
  }
}
