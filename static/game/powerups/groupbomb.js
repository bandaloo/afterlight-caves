import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bomb } from "../bomb.js";
import { addToWorld } from "../../modules/gamemanager.js";

const MAX_SUB_BOMBS = 10;

export class GroupBomb extends PowerUp {
  /**
   * Your bombs spawn sub-bombs when they explode
   * @param {number} magnitude how many extra bombs to spawn
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(pos, magnitude, "Group Bomb", "Your bombs explode into sub-bombs");
    /**
     * @type {{name: string, data: number, func: (b: Bomb, n: number) => void}} */
    this.existingGroupBomb = undefined;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      if (this.existingGroupBomb) {
        // increase magnitude of existing function
        this.existingGroupBomb.data += this.magnitude;
        return;
      }
      /**
       * Spawns a number of sub-bombs that fly out from the parent in a circle
       * @param {Bomb} bomb parent bomb
       * @param {number} num number of sub-bombs to spawn
       */
      const f = (bomb, num) => {
        let theta = Math.random() * 2 * Math.PI;
        for (let i = 0; i < num; i++) {
          // rotate around so new bombs are distributed evenly
          if (i !== 0) theta += (1 / num) * 2 * Math.PI;
          let r = bomb.speed;
          if (r < 2) r = 2;
          const newVel = new Vector(Math.cos(theta) * r, Math.sin(theta) * r);
          const child = creature.getBomb(bomb.pos);
          child.vel = newVel;
          child.speed = r;
          child.wallReflectSpeed = r;
          /**
           * remove Group Bomb functions from child so it doesn't multiply
           * forever
           * @type {{
           *   name: string, data: number, func: (b: Bomb, n:number) => void}[]
           * }
           */
          const newOnDetonate = new Array();
          for (const od of bomb.onDetonate) {
            if (od.name && od.name !== this.powerUpClass) {
              newOnDetonate.push(od);
            }
          }
          child.onDetonate = newOnDetonate;
          addToWorld(child);
        }
      };
      creature.bombOnDetonate.push({
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
    for (const obj of creature.bombOnDetonate) {
      if (obj.name && obj.name === this.powerUpClass) {
        this.existingGroupBomb = obj;
        if (obj.data > MAX_SUB_BOMBS) {
          return true;
        }
        // see if we need to trim magnitude
        const availMag = Math.floor(MAX_SUB_BOMBS - obj.data);
        if (availMag < 1) return true;

        this.magnitude = Math.min(availMag, this.magnitude);
        return false;
      }
    }
    return false;
  }
}
