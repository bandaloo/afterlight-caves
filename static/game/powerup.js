import { Vector } from "../modules/vector.js";
import { Entity, FarEnum } from "../modules/entity.js";
import { Creature } from "./creature.js";
import { centeredText, drawShines, circle } from "./draw.js";
import { TextDisplay } from "./textdisplay.js";
import { addToWorld } from "../modules/gamemanager.js";

/**
 * @abstract
 */
export class PowerUp extends Entity {
  /**
   * constructs a new powerup
   * @param {Vector} [pos = new Vector(0, 0)]
   * @param {number} [magnitude = 1] each powerup has a magnitude 1-5, e.g. how
   * much more damage you deal. 1 by default.
   * @param {string} [powerUpClass] the class of powerup, e.g. "Damage Up" or
   * "Zoom"
   * @param {string} [description] short description of what this powerup does
   */
  constructor(
    pos = new Vector(0, 0),
    magnitude = 1,
    powerUpClass = "Null Power Up",
    description = "This Power Up is a mystery"
  ) {
    super(pos);
    this.type = "PowerUp";
    this.farType = FarEnum.deactivate;
    this.magnitude = magnitude;
    // set color based on magnitude
    this.colors = [
      [168, 157, 157], // gray
      [21, 189, 79], // green
      [46, 98, 219], // blue
      [211, 9, 222], // purple
      [255, 165, 0] // orange
    ][this.magnitude - 1];
    this.powerUpClass = powerUpClass;
    this.description = description;
    this.width = 60;
    this.height = 60;
    /**
     * @type {{ angle: number
     *        , width: number
     *        , length: number
     *        , speed: number
     *        }[]
     * }
     */
    this.shines = new Array(10);
    for (let i = 0; i < 10; ++i) {
      this.shines[i] = {
        angle: Math.random() * 2 * Math.PI,
        width: 0.35 + Math.random() * 0.2,
        length: 40 + Math.floor(Math.random() * 25),
        speed: 0.01 + Math.random() * 0.03
      };
    }
  }

  /**
   * applies this powerup to a creature, if it's not at max. If it isAtMax,
   * this function calls overflowAction
   * @param {Creature} creature
   * @virtual
   */
  apply(creature) {
    // Set the creature's powerup magnitude for this type of powerup
    const newMag = this.magnitude + creature.powerUps.get(this.powerUpClass);
    creature.powerUps.set(this.powerUpClass, newMag);

    // display the name on the screen if the hero picked it up
    // this needs to be last in case something changes before we get here
    if (creature.type === "Hero") {
      // this draw position usage is fine
      const textPos = this.drawPos.add(new Vector(0, -100));
      const td = new TextDisplay(
        this.powerUpClass + " " + this.magnitude,
        textPos,
        120,
        undefined,
        ...this.colors
      );

      addToWorld(td);
    }
  }

  /**
   * Returns true if the creature is at the max level for this powerup.
   *
   * PowerUps should override this, because there is no limit by default
   * The only side-effect this should have is trimming the magnitude of this.
   * For example, if you want to set a maximum total Damage magnitude at 100,
   * and the player has 97 and picks up a Damage 5, it is acceptable to trim it
   * to a Damage 3 in this method
   * @param {Creature} creature
   * @return {boolean} true if this can't be applied
   */
  isAtMax(creature) {
    return false;
  }

  /**
   * The function called when a powerup isn't applied due to reaching the
   * maximum magnitude for a powerup class.
   *
   * By default it adds 5% health per magnitude level, but can be overridden to
   * do something else
   * @param {Creature} creature
   */
  overflowAction(creature) {
    creature.gainHealth(creature.maxHealth * 0.5 * this.magnitude);
    if (creature.type === "Hero") {
      const textPos = this.drawPos.add(new Vector(0, -100));
      console.log("Hero at max");
      const td = new TextDisplay(
        "Max " + this.powerUpClass + " reached",
        textPos,
        120,
        undefined,
        ...this.colors
      );

      addToWorld(td);
    }
  }

  /**
   * draws the powerup as a circle with a letter in the middle
   * @override
   */
  draw() {
    // shines
    const drawColor = `rgb(${this.colors[0]}, ${this.colors[1]}, ${this.colors[2]})`;
    drawShines(this.drawPos, this.shines, drawColor);
    for (const s of this.shines) {
      s.angle += s.speed;
      if (s.angle > 2 * Math.PI) s.angle -= 2 * Math.PI;
    }
    // circle
    circle(this.drawPos, 32, "black", 4, drawColor);
    // text
    centeredText(
      this.powerUpClass.slice(0, 1),
      this.drawPos.add(new Vector(0, 16)),
      "bold 50px sans-serif",
      "center",
      "alphabetic",
      drawColor
    );
  }
}
