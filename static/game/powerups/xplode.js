import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bullet } from "../bullet.js";
import { addToWorld } from "../../modules/gamemanager.js";

const MAX_EXPLODES = 10;
const FIRE_DELAY_ADDEND = 10;

export class Xplode extends PowerUp {
  /**
   * Makes your bullets explode
   * @param {Vector} pos
   * @param {number} magnitude number of new bullets to spawn
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Xplode");
    /** 
     * @type {{
     *  name: string, data: number, func: (b: Bullet, n: number) => void
     * }}
     */
    this.existingXplode = undefined;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);

      // if the creature already has an Xplode powerup, just increase its data
      // value so it spawns more bullets to implement stacking
      if (this.existingXplode) {
        this.existingXplode.data += this.magnitude;
        return;
      }

      // otherwise add a new bulletOnDestroy function to make the bullets split
      /**
       * @param {Bullet} b the parent bullet
       * @param {number} [num] the number of bullets to spawn
       */
      const f = (b, num = 1) => {
        let theta = Math.random() * 2 * Math.PI;
        for (let i = 0; i < num; i++) {
          // rotate around so new bullets are distributed evenly
          if (i !== 0) theta += (1 / num) * 2 * Math.PI;
          const newVel = new Vector(Math.cos(theta), Math.sin(theta)).norm2();
          const child = creature.getBullet(newVel, b.good, b.color);
          child.vel = child.vel.norm2().mult(creature.bulletSpeed * 0.75);
          child.pos = b.pos;
          /**
           * remove xplode functions from child so it doesn't multiply forever
           * @type {
           *   {name: string, data: number, func: (function(Bullet): void)}[]
           * }
           */
          const newOnDestroy = new Array();
          for (const od of b.onDestroy) {
            if (od.name && od.name !== this.powerUpClass) {
              newOnDestroy.push(od);
            }
          }
          child.onDestroy = newOnDestroy;
          addToWorld(child);
        }
      };

      creature.fireDelay += FIRE_DELAY_ADDEND * this.magnitude;
      creature.bulletOnDestroy.push({
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
    // figure out how many bullets this already explodes into
    for (const obj of creature.bulletOnDestroy) {
      if (obj.name && obj.name === this.powerUpClass) {
        this.existingXplode = obj;
        // is the number of explodes already too high?
        if (obj.data >= MAX_EXPLODES)
          return true;

        // see if we need to trim magnitude
        const availMag = Math.floor(Math.abs(MAX_EXPLODES - obj.data));
        if (availMag < 1) return true;

        this.magnitude = Math.min(availMag, this.magnitude);
        return false;
      }
    }
    return false;
  }
}
