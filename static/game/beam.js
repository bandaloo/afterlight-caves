import { Bullet } from "./bullet.js";
import { Vector } from "../modules/vector.js";

export class Beam extends Bullet {
  /**
   * constructs a new beam
   * @param {Vector} [pos] the position of the origin of the beam
   * @param {boolean} [good] false by default
   * @param {string} [color] default "white",
   * @param {number} [lifetime] how long this beam survives, in game steps
   * @param {number} [damage] how much damage this beam deals
   */
  constructor(
    pos = new Vector(0, 0),
    good = false,
    color = "white",
    lifetime = 100,
    damage = 1
  ) {
    super(
      pos,
      new Vector(0, 0),
      new Vector(0, 0),
      good,
      color,
      lifetime,
      damage
    );
  }

  destroy() {
    // execute all on-destroy functions
    for (const od of this.onDestroy) {
      if (od["func"]) od["func"](this, od["data"]);
    }
  }
}
