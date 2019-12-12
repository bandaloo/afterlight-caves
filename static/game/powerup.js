import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { Creature } from "./creature.js";
import { centeredOutlineCircle, centeredText, drawShines } from "./draw.js";
import { TextDisplay } from "./textdisplay.js";
import { addToWorld } from "../modules/gamemanager.js";

/**
 * @abstract
 */
export class PowerUp extends Entity {
  /**
   * constructs a new powerup
   * @param {Vector} pos
   * @param {number} [magnitude] each powerup has a magnitude 1-5, e.g. how big
   * Bigify makes you. 1 by default.
   */
  constructor(pos, magnitude = 1) {
    super(pos);
    this.type = "PowerUp";
    this.magnitude = magnitude;
    this.hue = [0, 134, 204, 275, 39][this.magnitude - 1];
    this.powerUpName = "Null PowerUp";
    this.width = 60;
    this.height = 60;
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
   * applies this powerup to a creature
   * @param {Creature} creature
   * @virtual
   */
  apply(creature) {
    creature.powerUpsList.push(this.powerUpName);
    // display the name on the screen
    const textPos = this.drawPos.add(new Vector(0, -100));
    const td = new TextDisplay(
      this.powerUpName,
      textPos,
      120,
      this.hue,
      "rgba(0, 0, 0, 0)"
    );
    if (creature.type === "Hero") {
      addToWorld(td);
    }
  }

  /**
   * draws the powerup as a yellow circle with a letter in the middle
   * @override 
   */
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
    centeredOutlineCircle(
      this.drawPos,
      30,
      4,
      "hsl(" + this.hue + ", 100%, 50%)",
      "black"
    );
    // text
    centeredText(
      this.powerUpName.slice(0, 1),
      this.drawPos.add(new Vector(0, 16)),
      "hsl(" + this.hue + ", 100%, 50%)",
      "rgba(0, 0, 0, 0)",
      "bold 50px Arial"
    );
  }
}
