import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BULLET_WALL_REFLECT_SPEED = 5;
const ELASTICITY_FACTOR = 0.75;

export class Elastic extends PowerUp {
  /**
   * Makes your bullets bounce off walls
   * @param {number} magnitude how bouncy your bullets are, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(pos, magnitude, "Elastic", "Makes your bullets bouncy");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bulletReflectsOffWalls = true;
      creature.bulletWallReflectSpeed += this.magnitude * ELASTICITY_FACTOR;
    } else {
      this.overflowAction(creature);
    }
  }

  /**
   * returns true if the creature is at the max level for this powerup.
   * trims magnitude it if would push the creature over the limit
   * @param {Creature} creature
   * @override
   */
  isAtMax(creature) {
    // check if bulletWallReflectSpeed is already too high
    if (creature.bulletWallReflectSpeed >= MAX_BULLET_WALL_REFLECT_SPEED) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BULLET_WALL_REFLECT_SPEED - creature.bulletWallReflectSpeed) /
        ELASTICITY_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
