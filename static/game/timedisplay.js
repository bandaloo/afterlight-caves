import { GuiElement } from "../modules/guielement";
import { Vector } from "../modules/vector";

export class TimeDisplay extends GuiElement {
  constructor(pos) {
    super(pos);
    this.borderVec = new Vector(8, 100);
    this.time = 100 * 60 * 5; // five minutes
  }

  action() {}

  draw() {}
}
