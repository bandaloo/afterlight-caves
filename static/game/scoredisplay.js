import { Vector } from "../modules/vector.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { GuiElement } from "../modules/guielement.js";
import { centeredText } from "./draw.js";
import { Hero } from "./hero.js";

/**
 * @param {number} num
 * @return {string}
 */
export const toScoreString = num => {
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
      "bold 60px anonymous",
      "right",
      undefined,
      "white"
    );
    // draw points being added
    if (this.score != this.visibleScore) {
      centeredText(
        "+" + Math.floor(this.score - this.visibleScore),
        this.pos.add(new Vector(0, 100)),
        "bold 60px anonymous",
        "right",
        undefined,
        "white"
      );
    }
  }

  /**
   * function to get how much to take off the score counter for animation
   */
  scoreChunk() {
    const invisibleScore =
      /** @type {Hero} */ (getImportantEntity("hero")).score -
      this.visibleScore;
    return Math.min(Math.floor(0.1 * invisibleScore) + 5, invisibleScore);
  }

  /**
   * @override
   */
  action() {
    const hero = getImportantEntity("hero");
    const heroScore = /** @type {Hero} */ (hero).score;
    if (heroScore != this.score) {
      this.score = heroScore;
      this.staticCounter = 60;
    }
    if (this.staticCounter <= 0 && this.score !== this.visibleScore) {
      this.visibleScore += this.scoreChunk();
    }
    if (this.staticCounter > 0) this.staticCounter--;
  }
}
