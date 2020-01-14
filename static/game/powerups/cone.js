import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_SPLIT_BULLETS = 10;
const BULLET_DAMAGE_FACTOR = 1.2;

export class Cone extends PowerUp {
  /**
   * Instead of firing one bullet you fire a cone of bullets
   * @param {Vector} pos
   * @param {number} magnitude number of new bullets to add to the cone
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude, "Cone", "Fire a cone of bullets when you shoot");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletsPerShot += this.magnitude;
      creature.bulletDamage *= (1 / this.magnitude) * BULLET_DAMAGE_FACTOR;
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
    // is the number of explodes already too high?
    if (creature.bulletsPerShot >= MAX_SPLIT_BULLETS) return true;

    // see if we need to trim magnitude
    const availMag = Math.floor(
      Math.abs(MAX_SPLIT_BULLETS - creature.bulletsPerShot)
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
