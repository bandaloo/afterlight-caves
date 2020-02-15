import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Hero } from "./hero.js";

export class TimeDisplay extends GuiElement {
  constructor(pos) {
    super(pos);
    this.borderVec = new Vector(8, 8);
    this.time = (100 * 60 * 1) / 2; // five minutes
    //this.time = 100;
  }

  action() {
    if (this.time > 0) {
      this.time--;
    } else {
      /** @type {Hero} */ (getImportantEntity("hero")).takeDamage(Infinity);
    }
  }

  stepsToTimeString() {
    const minutes = Math.floor(this.time / (60 * 100));
    const seconds = Math.floor((this.time - minutes * 60 * 100) / 100);
    return `${minutes}:${seconds}`;
  }

  draw() {
    centeredText(
      this.stepsToTimeString() + " 💀",
      this.pos.add(this.borderVec),
      "bold 60px anonymous",
      "left",
      "middle",
      "white"
    );
  }
}
