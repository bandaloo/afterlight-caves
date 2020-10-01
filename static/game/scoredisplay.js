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

const SCORE_OFFSET = 50;
const NUMBER_VISIBLE = 8;
const FADE_START = 5;

/**
 * A class that handles displaying the score, and can show it increasing with
 * nice animations
 */
export class ScoreDisplay extends GuiElement {
  /** @type {number} */
  visibleScore;
  /** @type {number} */
  score;
  /** @type {number[]} */
  scoresToAdd;

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
    this.scoresToAdd = [];
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

    for (let i = 0; i < this.scoresToAdd.length; i++) {
      // draw points being added
      centeredText(
        "+" + Math.floor(this.scoresToAdd[i]),
        this.pos.add(new Vector(0, i == 0 ? 100 : 50 + SCORE_OFFSET * (i + 1))),
        "bold 60px anonymous",
        "right",
        undefined,
        "rgb(255, 255, 255," +
          Math.min(
            1 - (i + 1 - FADE_START) / (NUMBER_VISIBLE - FADE_START),
            1
          ) +
          ")"
      );
    }
  }

  /**
   * function to get how much to take off the score counter for animation
   */
  scoreChunk() {
    return Math.min(
      Math.floor(0.1 * (this.score - this.visibleScore)) + 5,
      this.score - this.visibleScore
    );
  }

  /**
   * @override
   */
  action() {
    const hero = getImportantEntity("hero");
    const heroScore = /** @type {Hero} */ (hero).score;
    if (heroScore != this.score) {
      this.scoresToAdd.push(heroScore - this.score);
      this.score = heroScore;
      if (this.scoresToAdd.length == 1) this.staticCounter = 60;
    }
    if (this.staticCounter <= 0 && this.score !== this.visibleScore) {
      let scoreChunk = this.scoreChunk();
      this.visibleScore += scoreChunk;

      //Iterate over existing scores and subtract them as needed
      while (scoreChunk > 0) {
        if (this.scoresToAdd.length > 0) {
          if (this.scoresToAdd[0] > scoreChunk) {
            this.scoresToAdd[0] -= scoreChunk;
            scoreChunk = 0;
          } else {
            scoreChunk -= this.scoresToAdd[0];
            this.scoresToAdd.shift();
          }
        }
      }
    }
    if (this.staticCounter > 0) this.staticCounter--;
  }
}
