import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";
import { Bullet } from "../bullet.js";
import { addToWorld } from "../../modules/gamemanager.js";

export class Xplode extends PowerUp {
  /**
   * Makes your bullets explode
   * @param {Vector} pos
   * @param {number} magnitude number of new bullets to spawn
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Xplode");
    this.powerUpName = this.powerUpClass + " " + this.magnitude;
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   * @returns {Boolean}
   */
  apply(creature) {
    if (!super.apply(creature)) {
      super.overflowAction(creature);
      return false;
    }
    /** @param {Bullet} b */
    const f = b => {
      /** @type {number} */
      const mag = b.vel.mag();
      let theta = Math.random() * 2 * Math.PI;
      for (let i = 0; i < this.magnitude; i++) {
        // rotate around so new bullets are distributed evenly
        theta += (1 / this.magnitude) * 2 * Math.PI;
        const newVel = new Vector(Math.cos(theta), Math.sin(theta)).norm2();
        const child = creature.getBullet(newVel, b.good, b.color);
        child.vel = child.vel.norm2().mult(creature.bulletSpeed * 0.75);
        child.pos = b.pos;
        // make new empty onDestroy array so that these don't multiply forever
        child.onDestroy = new Array();

        addToWorld(child);
      }
    };
    if (creature.bulletOnDestroy.length < 10) creature.bulletOnDestroy.push(f);
    creature.fireDelay *= 2;
    return true;
  }
}
