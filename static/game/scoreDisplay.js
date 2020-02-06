import { TextDisplay } from "./textdisplay";
import { Vector } from "../modules/vector";
import { getCanvas } from "../modules/gamemanager";

/**
 * @param {number} num
 * @return {string}
 */
const toScoreString = num => {
  let str = Math.floor(num).toString();
  while (str.length < 6) {
    str = "0" + str;
  }
  return str;
};

/**
 * A class that handles displaying the score, and can show it increasing with
 * nice animations
 */
export class scoreDisplay extends TextDisplay {
  /** @type {number} */
  visibleScore;
  /** @type {number} */
  scoreToAdd;

  constructor() {
    super(
      toScoreString(0),
      new Vector(getCanvas().width - 100, 36),
      Infinity,
      "bold 50px sans-serif",
      255,
      255,
      255,
      "white",
      0,
      "right"
    );
    this.visibleScore = 0;
    this.scoreToAdd = 0;
  }

  /**
   * @param {number} amt 
   */
  addPoints(amt) {
    this.scoreToAdd += Math.floor(amt);
  }

  action() {
    if (this.scoreToAdd > 0) {
      const diff = Math.min(this.scoreToAdd, 5);
      this.scoreToAdd -= diff;
      this.visibleScore += diff;
    }
  }
}
