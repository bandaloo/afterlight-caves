import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_SPLIT_BULLETS = 10;
const FIRE_DELAY_ADDEND = 10;

export class Cone extends PowerUp {
  /**
   * Instead of firing one bullet you fire a cone of bullets
   * @param {number} magnitude number of new bullets to add to the cone
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Cone", "Fire a cone of bullets when you shoot");
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
      creature.fireDelay += this.magnitude * FIRE_DELAY_ADDEND;
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
    // is the number of bullets per shot already too high?
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
