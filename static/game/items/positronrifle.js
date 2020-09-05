import { Item } from "../item.js";
import { Vector } from "../../modules/vector.js";
import { Hero } from "../hero.js";
import { Beam } from "../bullet.js";

/**
 * Collecting the Positron Rifle replaces your regular bullets with a powerful
 * beam attack
 */
export class PositronRifle extends Item {

  /**
   * @param {Vector} pos
   */
  constructor(pos = new Vector(0, 0)) {
    super(pos, "Positron Rifle", "Fire a devastating beam", 500, "!", 3);
  }

  /**
   * gives the hero the beam effect
   * @param {Hero} hero
   * @override
   */
  addEffect(hero) {
    hero.bulletType = Beam;
    hero.fireDelay += 100;
    hero.bulletLifetime = Math.max(50, hero.bulletLifetime - 200);
  }
}
