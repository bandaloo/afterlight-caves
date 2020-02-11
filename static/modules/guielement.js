import { Vector } from "./vector.js";

export class GuiElement {
  /** @type {Vector} */
  pos;

  /** @type {boolean} */
  active = true;

  /** @type {boolean} */
  closeMe = false;

  /**
   * @param {Vector} pos
   */
  constructor(pos) {
    this.pos = pos;
  }

  /**
   * updates this GuiElement
   * @override
   */
  action() {}

  /**
   * draws this GuiElement
   * @override
   */
  draw() {}

  /**
   * called when the GuiElement is closed
   */
  onClose() {}
}
