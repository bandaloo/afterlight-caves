import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bullet } from "../bullet.js";
import { Burning } from "../statuseffects/burning.js";
import { circle } from "../draw.js";

const BURNING_LENGTH_FACTOR = 1;
const BURNING_CHANCE_FACTOR = 0.05;

export class FlameThrower extends PowerUp {
  /**
   * Your bullets set enemies on fire
   * @param {number} magnitude how long the enemies burn for
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Flamethrower", "Your bullets light enemies on fire");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      if (!creature.powerUps.has("Flamethrower")) {
        console.log("applying visual effect");
        creature.bulletVisualEffects.push(entity => {
          circle(entity.drawPos, (entity.width / 2) * 1.2, "#f5934299");
          console.log("drawing");
        });
        //console.log(creature.bulletVisualEffects);
      }
      super.apply(creature);
      /**
       * @param {Bullet} b the bullet this spawned
       * @param {number} [duration] the duration for burning to last, in seconds
       * @param {Creature} other the creature we hit
       */
      const f = (b, duration = 1, other) => {
        if (this.magnitude * BURNING_CHANCE_FACTOR < Math.random()) {
          new Burning(duration * BURNING_LENGTH_FACTOR * 60).apply(other);
        }
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
