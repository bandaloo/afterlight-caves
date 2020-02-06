export class GuiElement {
  /** @type {Vector} */
  pos;

  /** @type {boolean} */
  active = true;

  /**
   * @param {Vector} pos
   */
  constructor(pos) {
    this.pos = pos;
  }

  /**
   * draws this GuiElement
   * @override
   */
  action() {}

  /**
   * draws this GuiElement
   * @override
   */
  draw() {}
}
