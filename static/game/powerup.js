import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { Hero } from "./hero.js";
import { centeredOutlineCircle, centeredText, drawShines } from "./draw.js";

export class PowerUp extends Entity {
  /**
   * constructs a new powerup
   * @param {Vector} pos
   * @param {number} [magnitude] each powerup has a magnitude, e.g. how big
   * Bigify makes you, or how much extra speed Speed Up gives you. 2 by default.
   * @param {string} color color of the text and outline
   */
  constructor(pos, magnitude = 1, color = "#007acc") {
    super(pos);
    this.magnitude = magnitude;
    this.type = "PowerUp";
    this.color = color;
    this.powerUpName = "Null PowerUp";
    this.shineRotation = 0;
    /**
     * @type {{angle: number, width: number, length: number, speed: number,hue: number}[]}
     */
    this.shines = new Array(30);
    for (let i = 0; i < 30; ++i) {
      this.shines[i] = {
        angle: Math.random() * 2 * Math.PI,
        width: 0.15 + Math.random() * 0.2,
        length: 50 + Math.floor(Math.random() * 25),
        speed: 0.01 + Math.random() * 0.03,
        hue: Math.floor(Math.random() * 360)
      };
    }
  }

  /**
   * applies this powerup to the hero
   * @param {Hero} hero
   */
  applyToHero(hero) {
    hero.powerUpsList.push(this.powerUpName);
  }

  /**
   * draws the powerup as a yellow circle with a letter in the middle
   * @override */
  draw() {
    // shines
    drawShines(this.drawPos, this.shines);
    for (const s of this.shines) {
      s.angle += s.speed;
      s.hue += 5;
      if (s.angle > 2 * Math.PI) s.angle -= 2 * Math.PI;
      if (s.hue >= 360) {
        s.hue = 0;
      }
    }
    // circle
    centeredOutlineCircle(this.drawPos, 30, 4, this.color, "black");
    // text
    centeredText(
      this.powerUpName.slice(0, 1),
      this.drawPos.add(new Vector(0, 16)),
      this.color,
      "bold 50px Arial"
    );
  }
}
