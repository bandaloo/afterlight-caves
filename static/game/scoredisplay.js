import { Vector } from "../modules/vector.js";
import { GuiElement } from "../modules/guielement.js";
import { centeredText } from "./draw.js";

/**
 * @param {number} num
 * @return {string}
 */
const toScoreString = num => {
  let str = Math.floor(num).toString();
  str.padStart(6, "0");
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
  scoreToAdd;
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
    this.scoreToAdd = 0;
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
      "white",
    );
    // draw points being added
    if (this.scoreToAdd > 0) {
    centeredText(
      "+" + Math.floor(this.scoreToAdd),
      this.pos.add(new Vector(0, 100)),
      "bold 60px monospace",
      "right",
      "center",
      "white",
    );
    }
  }

  /**
   * @param {number} amt 
   */
  addPoints(amt) {
    this.scoreToAdd += Math.floor(amt);
    this.staticCounter = 60;
  }

  /**
   * @override
   */
  action() {
    if (this.staticCounter > 0) {
      this.staticCounter--;
    } else {
      if (this.scoreToAdd > 0) {
        const diff = Math.min(this.scoreToAdd, 5);
        this.scoreToAdd -= diff;
        this.visibleScore += diff;
      }
    }
  }
}
