import { Item } from "../item.js";
import { Vector } from "../../modules/vector.js";
import { Hero } from "../hero.js";
import { Beam } from "../bullet.js";
import { centeredRect } from "../draw.js";

/**
 * Collecting the Positron Rifle replaces your regular bullets with a powerful
 * beam attack
 */
export class PositronRifle extends Item {
  /**
   * @param {Vector} pos
   */
  constructor(pos = new Vector(0, 0)) {
    super(pos, "Positron Rifle", "Fire a devastating beam", 500);
  }

  /**
   * applies this item to the hero
   * @param {Hero} hero
   * @override
   */
  apply(hero) {
    hero.positronParts++;
    // if you have all parts give the hero the beam
    if (hero.positronParts === 3) {
      hero.bulletType = Beam;
      hero.fireDelay += 100;
      hero.bulletLifetime = Math.max(50, hero.bulletLifetime - 200);
    }
  }

  /**
   * @override
   */
  draw() {
    centeredRect(this.drawPos, this.width, this.height, "yellow");
  }
}
