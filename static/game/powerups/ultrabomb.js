import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Creature } from "../creature.js";

const MAX_BOMB_TIME_TO_EXPLODE = 1000;
const EXPLOSION_TIME_FACTOR = 15;

export class UltraBomb extends PowerUp {
  /**
   * Increases your bomb explosion time
   * @param {number} magnitude how much to increase bomb explosion time, 1-5
   * @param {Vector} [pos]
   */
  constructor(magnitude = 1, pos) {
    super(magnitude, pos, "Ultra Bomb", "Makes your bombs explode longer");
  }

  /**
   * applies this powerup
   * @param {Creature} creature
   * @override
   */
  apply(creature) {
    if (!this.isAtMax(creature)) {
      super.apply(creature);
      creature.bombTimeToExplode += this.magnitude * EXPLOSION_TIME_FACTOR;
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
    // creature bomb explosion time is already at or over the limit
    if (creature.bombTimeToExplode >= MAX_BOMB_TIME_TO_EXPLODE) {
      return true;
    }

    // see if we need to trim magnitude
    const availMag = Math.floor(
      (MAX_BOMB_TIME_TO_EXPLODE - creature.bombTimeToExplode) /
        EXPLOSION_TIME_FACTOR
    );
    if (availMag < 1) return true;

    this.magnitude = Math.min(availMag, this.magnitude);
    return false;
  }
}
