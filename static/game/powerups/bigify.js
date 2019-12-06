import { PowerUp } from "../powerup.js";
import { Vector } from "../../modules/vector.js";
import { Hero } from "../hero.js";

export class Bigify extends PowerUp {
  /**
   * 
   * @param {Vector} pos
   * @param {number} magnitude how big this makes you, 1-5
   */
  constructor(pos, magnitude = 1) {
    super(pos, magnitude);
    this.powerUpName = "Bigify " + this.magnitude;
  }

  /**
   * applies this powerup to the hero
   * @param {Hero} hero
   * @override
   */
  applyToHero(hero) {
    super.applyToHero(hero);
    hero.width += this.magnitude * 20;
    hero.height += this.magnitude * 20;
  }
}