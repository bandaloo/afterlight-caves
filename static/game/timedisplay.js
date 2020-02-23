import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";
import {
  getImportantEntity,
  getPause,
  getGuiElement
} from "../modules/gamemanager.js";
import { Hero } from "./hero.js";
import { DeathScreen } from "./deathscreen.js";

export class TimeDisplay extends GuiElement {
  /**
   * @param {Vector} pos
   * @param {number} time
   */
  constructor(pos, time) {
    super(pos);
    this.borderVec = new Vector(8, 8);
    this.time = time; // was 100 * 60 * 5
    this.animPulse = 1;
  }

  action() {
    // prevent the timer from ticking down while the player is dead
    const deathScreen = /** @type {DeathScreen} */ (getGuiElement(
      "deathscreen"
    ));
    if (!getPause() && !deathScreen.active) {
      if (this.time > 0) {
        this.time--;
      } else {
        /** @type {Hero} */ (getImportantEntity("hero")).takeDamage(Infinity);
        deathScreen.causeOfDeath = "Time up";
      }
      // exactly on a second
      if (this.time !== 0 && this.time % 100 === 0) {
        this.animPulse = 1;
      }
      this.animPulse *= 0.9;
    }
  }

  stepsToTimeString() {
    const minutes = Math.floor(this.time / (60 * 100));
    const seconds = Math.floor((this.time - minutes * 60 * 100) / 100);
    return `${minutes}:${(seconds + "").padStart(2, "0")}`;
  }

  draw() {
    let color = "white";
    if (this.time < 100 * 30) color = "orange";
    if (this.time < 100 * 10) color = "red";
    // draw time
    centeredText(
      this.stepsToTimeString(),
      this.pos.add(this.borderVec),
      `bold ${Math.floor(this.animPulse * 8 + 60)}px anonymous`,
      "left",
      "middle",
      color
    );
  }
}
