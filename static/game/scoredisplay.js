import { Vector } from "../modules/vector.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { GuiElement } from "../modules/guielement.js";
import { centeredText } from "./draw.js";

/**
 * @param {number} num
 * @return {string}
 */
const toScoreString = num => {
  let str = Math.floor(num).toString();
  str = str.padStart(6, "0");
  return str;
};

/**
 * A class that handles displaying the score, and can show it increasing with
 * nice animations
 */
export class ScoreDisplay extends GuiElement {
  /** @type {number} */
  visibleScore;
  /** @type {number} */
  score;

  /**
   * @type {number} number of game steps to display scoreToAdd before adding it
   * to visibleScore
   */
  staticCounter;

  /**
   * @param {Vector} pos top-right position
   */
  constructor(pos) {
    super(pos);
    this.visibleScore = 0;
    this.score = 0;
  }

  /**
   * @override
   */
  draw() {
    // TODO maybe improve how this looks
    // draw visible score
    centeredText(
      toScoreString(this.visibleScore),
      this.pos.add(new Vector(0, 50)),
      "bold 60px monospace",
      "right",
      "center",
      "white"
    );
    // draw points being added
    if (this.score != this.visibleScore) {
      centeredText(
        "+" + Math.floor(this.score - this.visibleScore),
        this.pos.add(new Vector(0, 100)),
        "bold 60px monospace",
        "right",
        "center",
        "white"
      );
    }
  }

  /**
   * @override
   */
  action() {
    this.hero = getImportantEntity("hero");
    const heroScore = /** @type {Creature} */ (this.hero).score;
    if (heroScore != this.score) {
      this.score = heroScore;
      this.staticCounter = 60;
    }
    if (this.staticCounter <= 0 && this.score != this.visibleScore) {
      this.visibleScore += 1;
    }
    if (this.staticCounter > 0) this.staticCounter--;
  }
}
