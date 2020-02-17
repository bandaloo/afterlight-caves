import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bomb } from "../bomb.js";
import { addToWorld } from "../../modules/gamemanager.js";

const MAX_SUB_BULLETS = 50;
const ORB_FACTOR = 2;

export class Orb extends PowerUp {
  /**
   * Your bombs spawn a ring of bullets when they explode
   * @param {number} magnitude how many bombs to spawn
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Orb", "Bombs explosions make bullet rings");
    /**
     * @type {{name: string, data: number, func: (b: Bomb, n: number) => void}} */
    this.existingOrb = undefined;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      if (this.existingOrb) {
        // increase magnitude of existing function
        this.existingOrb.data += this.magnitude * ORB_FACTOR;
        return;
      }
      /**
       * Spawns a ring of bullets when bombs detonate
       * @param {Bomb} bomb parent bomb
       * @param {number} num number of sub-bullets to spawn
       */
      const f = (bomb, num) => {
        let theta = Math.random() * 2 * Math.PI;
        for (let i = 0; i < num; i++) {
          // rotate around so bullets are distributed evenly
          if (i !== 0) theta += (1 / num) * 2 * Math.PI;
          const newVel = new Vector(Math.cos(theta), Math.sin(theta));
          const child = bomb.owner.getBullet(newVel);
          child.pos = bomb.pos;
          addToWorld(child);
        }
      };
      creature.bombOnDetonate.push({
        name: this.powerUpClass,
        data: this.magnitude * ORB_FACTOR,
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
        if (obj.data > MAX_SUB_BULLETS) {
          return true;
        }
        // see if we need to trim magnitude
        const availMag = Math.floor(MAX_SUB_BULLETS - obj.data);
        if (availMag < 1) return true;

        this.magnitude = Math.min(availMag, this.magnitude);
        return false;
      }
    }
    return false;
  }
}
