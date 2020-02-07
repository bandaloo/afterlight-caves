import { Vector } from "../modules/vector.js";
import { GuiElement } from "../modules/guielement.js";
import { centeredText } from "./draw.js";
import { getScreenDimensions } from "../modules/gamemanager.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { toScoreString } from "./scoredisplay.js";

/**
 * The screen that appears when a player dies, including a nice fade-in and
 * score display.
 */
export class DeathScreen extends GuiElement {
  /** @type {number} */
  score;
  /** @type {number} */
  opacity;

  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(screenDimensions.width / 2, screenDimensions.height / 2));
    this.score = 0;
    this.opacity = 0;
  }

  /**
   * @override
   */
  draw() {
    centeredText(
      "You have died",
      this.pos,
      "bold 250px sans-serif",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    centeredText(
      "your score was:",
      this.pos.add(new Vector(0, 100)),
      "bold 60px monospace",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    centeredText(
      toScoreString(this.score),
      this.pos.add(new Vector(0, 160)),
      "bold 60px monospace",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    centeredText(
      'press "R" to restart the game',
      this.pos.add(new Vector(0, 250)),
      "bold 40px sans-serif",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
  }

  /**
   * @override
   */
  action() {
    this.hero = getImportantEntity("hero");
    this.score = /** @type {Creature} */ (this.hero).score;
    if (this.active) this.opacity += 0.01;
  }
}
