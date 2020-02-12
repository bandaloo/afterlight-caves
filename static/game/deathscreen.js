import { Vector } from "../modules/vector.js";
import { Menu } from "./menu.js";
import { centeredText } from "./draw.js";
import { getScreenDimensions, getContext } from "../modules/gamemanager.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { toScoreString } from "./scoredisplay.js";
import { resetDemo } from "../main.js";

/**
 * The screen that appears when a player dies, including a nice fade-in and
 * score display.
 */
export class DeathScreen extends Menu {
  /** @type {number} */
  score;
  /** @type {number} */
  opacity;

  constructor() {
    const screenDimensions = getScreenDimensions();
    super(
      new Vector(screenDimensions.width * 0.2, 0),
      screenDimensions.width * 0.6,
      screenDimensions.height,
      [{ text: "Restart", func: resetDemo}]
    );
    this.score = 0;
    this.opacity = 0;
    this.itemWidth = 400;
    this.selectedFillStyle = `rgba(0, 0, 255, ${this.opacity})`;
    this.downFillStyle = `rgba(68, 68, 204, ${this.opacity})`;
  }

  /**
   * @override
   */
  draw() {
    centeredText(
      "You have died",
      this.pos.add(new Vector(this.width / 2, this.height / 2)),
      "bold 250px sans-serif",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")",
      "rgba(0, 0, 0, " + this.opacity + ")",
      8
    );
    centeredText(
      "your score was:",
      this.pos.add(new Vector(this.width / 2, this.height / 2 + 100)),
      "bold 60px monospace",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    centeredText(
      toScoreString(this.score),
      this.pos.add(new Vector(this.width / 2, this.height / 2 + 160)),
      "bold 60px monospace",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    // TODO this is kind of a hack to push the normal menu elements down
    getContext().translate(0, 240);
    super.draw();
    getContext().translate(0, -240);
  }

  /**
   * @override
   */
  action() {
    this.hero = getImportantEntity("hero");
    this.score = /** @type {Creature} */ (this.hero).score;
    if (this.active) this.opacity += 0.01;
    this.selectedFillStyle = `rgba(0, 0, 255, ${this.opacity})`;
    this.downFillStyle = `rgba(68, 68, 204, ${this.opacity})`;
    super.action();
  }

  /**
   * does nothing, preventing the menu from being closed
   * @override
   */
  onBack() {}
}
