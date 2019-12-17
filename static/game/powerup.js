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
   * @param {String} powerUpClass the class of powerup, e.g. "Damage" or "Zoom"
   */
  constructor(pos, magnitude = 1, powerUpClass = "Null Powerup") {
    super(pos);
    this.type = "PowerUp";
    this.magnitude = magnitude;
    // set color based on magnitude
    this.hue = [0, 134, 204, 275, 39][this.magnitude - 1];
    this.powerUpClass = powerUpClass;
    this.width = 60;
    this.height = 60;
    /**
     * @type {{ angle: number
     *        , width: number
     *        , length: number
     *        , speed: number
     *        , hue: number
     *        }[]
     * }
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
      const textPos = this.drawPos.add(new Vector(0, -100));
      const td = new TextDisplay(
        this.powerUpClass + " " + this.magnitude,
        textPos,
        120,
        this.hue,
        "rgba(0, 0, 0, 0)"
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
        this.hue,
        "rgba(0, 0, 0, 0)"
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
      this.powerUpClass.slice(0, 1),
      this.drawPos.add(new Vector(0, 16)),
      "hsl(" + this.hue + ", 100%, 50%)",
      "rgba(0, 0, 0, 0)",
      "bold 50px Arial"
    );
  }
}
