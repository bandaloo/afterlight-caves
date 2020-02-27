import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bullet } from "../bullet.js";
import { Frozen } from "../statuseffects/frozen.js";
import { circle, centeredRect, polygon } from "../draw.js";
import { getGameTime } from "../../modules/gamemanager.js";

const FROZEN_LENGTH_FACTOR = 1;
const CHANCE_TO_FREEZE_CONST = 9;

export class Icy extends PowerUp {
  /**
   * Your bullets freeze enemies
   * @param {number} magnitude how long the enemies are frozen for
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Icy", "Your bullets have a chance to freeze");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      if (!creature.powerUps.has("Icy")) {
        creature.bulletVisualEffects.push(entity => {
          polygon(
            entity.drawPos,
            4,
            entity.width * 1.8,
            entity.height * 1.8,
            getGameTime() / 100,
            undefined,
            "#6af7e999",
            creature.powerUps.get("Icy")
          );
        });
      }
      super.apply(creature);
      /**
       * @param {Bullet} b the bullet this spawned
       * @param {number} [duration] the duration for frozen to last, in seconds
       * @param {Creature} other the creature we hit
       */
      const f = (b, duration = 1, other) => {
        // the duration (level of the powerup) determines the chance to freeze
        if (Math.random() < 1 / (CHANCE_TO_FREEZE_CONST - duration))
          new Frozen(duration * FROZEN_LENGTH_FACTOR * 60).apply(other);
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
    // For now I don't think it's possible to have too much icy
    return false;
  }
}
