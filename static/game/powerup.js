import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { Creature } from "./creature.js";
import { centeredOutlineCircle, centeredText, drawShines } from "./draw.js";
import { TextDisplay } from "./textdisplay.js";
import { addToWorld } from "../modules/gamemanager.js";

const maxMagnitudes = {
  Bigify: 3,
  Damage: 100,
  Elastic: 15,
  "Fire Rate": 100,
  Littlify: 3,
  Rubber: 10,
  Xplode: 5,
  Zoom: 100
};

/**
 * @abstract
 */
export class PowerUp extends Entity {
  /**
   * constructs a new powerup
   * @param {Vector} pos
   * @param {number} [magnitude] each powerup has a magnitude 1-5, e.g. how big
   * @param {String} powerUpClass the class of powerup, e.g. "Damage" or "Zoom"
   * Bigify makes you. 1 by default.
   */
  constructor(pos, magnitude = 1, powerUpClass = "Null Powerup") {
    super(pos);
    this.type = "PowerUp";
    this.magnitude = magnitude;
    this.hue = [0, 134, 204, 275, 39][this.magnitude - 1];
    this.powerUpClass = powerUpClass;
    this.powerUpName = this.powerUpClass + " " + this.magnitude;
    // this.powerUpName = "Null PowerUp";
    // this.powerUpClass = "Null PowerUp";
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
   * @returns {Boolean}
   */
  apply(creature) {
    // Update the creature's powerups
    let old_magnitude = 0;
    if (creature.powerupMagnitudes.has(this.powerUpClass)) {
      old_magnitude += creature.powerupMagnitudes.get(this.powerUpClass);
    }
    let new_magnitude = old_magnitude + this.magnitude;

    let apply = true;

    // Check the new upgrade to make sure the maximum magnitude isn't exceeded
    if (maxMagnitudes[this.powerUpClass] != undefined) {
      if (new_magnitude > maxMagnitudes[this.powerUpClass]) {
        // If it exceeds the max, cut off the overflow.
        const diff = new_magnitude - maxMagnitudes[this.powerUpClass];
        // If the entire powerup is overflow, don't apply it.
        if (diff >= this.magnitude) {
          apply = false;
        }
        // Cut off the overflow
        new_magnitude -= diff;
        this.magnitude -= diff;
      }
    }
    // Set the creatures magnitude
    creature.powerupMagnitudes.set(this.powerUpClass, new_magnitude);
    // Add the powerup to the creature's list
    creature.powerUpsList.push(this.powerUpName);

    // display the name on the screen
    const textPos = this.drawPos.add(new Vector(0, -100));
    const td = new TextDisplay(
      apply ? this.powerUpName : "Max " + this.powerUpClass + " Reached!",
      textPos,
      120,
      this.hue,
      "rgba(0, 0, 0, 0)"
    );

    if (creature.type === "Hero") {
      addToWorld(td);
    }

    return apply;
  }

  /**
   * The function called when a powerup isn't applied due to reaching the maximum magnitude for a powerup class
   * @param {Creature} creature
   */
  overflowAction(creature) {
    creature.currentHealth = Math.min(
      creature.currentHealth + creature.maxHealth * 0.15,
      creature.maxHealth
    );
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
