import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Burning } from "../statuseffects/burning.js";
import { circle, polygon } from "../draw.js";
import { getGameTime } from "../../modules/gamemanager.js";

const BURNING_LENGTH_FACTOR = 1;
const BURNING_CHANCE_FACTOR = 0.03;

export class Hot extends PowerUp {
  /**
   * You set enemies on fire
   * @param {number} magnitude how long the enemies burn for
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Hot", "Contact lights enemies on fire");
    /**
     * @type {{ name: string
     *        , data: number
     *        , func: (num: number, other: Creature) => void
     *        }}
     */
    this.existingHot = undefined;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      // don't apply the glow effect twice
      if (!creature.powerUps.has("Hot")) {
        const colors = ["#f5934233", "#fff64733"];
        creature.extraDrawFuncs.push(entity => {
          for (let i = 0; i < 2; i++) {
            const size = 1 / (1 + i);
            polygon(
              entity.drawPos,
              8,
              entity.width * 1.5 * size,
              entity.height * 1.5 * size,
              0,
              undefined,
              colors[i],
              10,
              n => {
                // graphs an upside down egg on polar coordinates
                const t = n + Math.PI;
                const egg = 0.5 * Math.sin(t) ** 2 + 0.5 * Math.sin(t) + 1;
                const wiggle =
                  1 + 0.2 * Math.cos((getGameTime() / 1000) * n * 3 + i);
                return egg * wiggle;
              }
            );
          }
        });
      }

      super.apply(creature);

      // if the creature already has a Hot powerup, just increase its data value
      if (this.existingHot) {
        this.existingHot.data += this.magnitude;
        return;
      }

      // otherwise add a new onTouchEnemy function to set enemies on fire
      /**
       * @param {number} duration the duration for burning to last, in seconds
       * @param {Creature} other the creature we hit
       */
      const f = (duration, other) => {
        if (Math.random() < duration * BURNING_CHANCE_FACTOR)
          new Burning(duration * BURNING_LENGTH_FACTOR * 60).apply(other);
      };

      creature.onTouchEnemy.push({
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
    // figure out if this already has a Hot powerup
    for (const obj of creature.onTouchEnemy) {
      if (obj.name && obj.name === this.powerUpClass) {
        this.existingHot = obj;
        // For now I don't think it's possible to have too much hot
        return false;
      }
    }
    // For now I don't think it's possible to have too much hot
    return false;
  }
}
