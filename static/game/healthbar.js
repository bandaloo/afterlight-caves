import { GuiElement } from "../modules/guielement.js";
import { Creature } from "./creature.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
export class Healthbar extends GuiElement {
  /** @type {number} */
  sizeScalar;
  /** @type {Vector} */
  borderVec;
  /** @type {Number} */
  healthHeight;
  /** @type {Creature} */
  hero;
  /** @type {Number} */
  health;
  /** @type {Number} */
  maxHealth;
  /** @type {Number} */
  maxHealthWidth;
  /** @type {Number} */
  healthWidth;
  /** @type {String} */
  healthColor;

  /**
   * @param {Vector} position on screen
   */
  constructor(pos) {
    super(pos);
    this.sizeScalar = 6;
    this.borderVec = new Vector(8, 8);
    this.healthHeight = 64;
    this.healthColor = "rgba(255, 50, 122, 90%)";
  }

  action() {
    this.hero = getImportantEntity("hero");
    this.health = /** @type {Creature} */ (this.hero).getCurrentHealth();
    this.maxHealth = /** @type {Creature} */ (this.hero).maxHealth;
    this.maxHealthWidth = this.maxHealth * this.sizeScalar;
    this.healthWidth = Math.max(this.health * this.sizeScalar, 0);
  }

  draw() {
    rect(
      this.borderVec,
      this.healthWidth,
      this.healthHeight,
      this.healthColor,
      this.healthColor,
      4
    );
    rect(
      this.borderVec,
      this.maxHealthWidth,
      this.healthHeight,
      undefined,
      "white",
      4
    );
    // round health to nearest tenth if it's not a whole number
    let healthString = "" + this.health;
    if (Math.floor(this.health) !== this.health)
      healthString = this.health.toFixed(1);
    centeredText(
      healthString,
      this.pos.add(this.borderVec).add(new Vector(0, this.healthHeight / 2)),
      "bold 60px sans-serif",
      "left",
      "middle",
      "white"
    );
  }
}
