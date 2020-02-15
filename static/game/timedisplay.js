import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";
import { getImportantEntity, getPause } from "../modules/gamemanager.js";
import { Hero } from "./hero.js";

export class TimeDisplay extends GuiElement {
  /**
   * @param {Vector} pos
   */
  constructor(pos) {
    super(pos);
    this.borderVec = new Vector(8, 8);
    this.time = 100 * 60 * 5; // five minutes
    this.animPulse = 1;
  }

  action() {
    if (!getPause()) {
      if (this.time > 0) {
        this.time--;
      } else {
        /** @type {Hero} */ (getImportantEntity("hero")).takeDamage(Infinity);
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
    // draw time
    centeredText(
      this.stepsToTimeString(),
      this.pos.add(this.borderVec),
      `bold ${Math.floor(this.animPulse * 8 + 60)}px anonymous`,
      "left",
      "middle",
      "white"
    );
  }
}
