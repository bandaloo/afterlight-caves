import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";
import { getScreenDimensions } from "../modules/gamemanager.js";

export class PauseScreen extends GuiElement {
  /**
   * @param {Vector} position on screen
   */
  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(screenDimensions.width / 2, screenDimensions.height / 2));
  }

  action() {}

  draw() {
    centeredText(
      "Paused!",
      this.pos,
      "bold 200px sans-serif",
      undefined,
      undefined,
      "red"
    );
    centeredText(
      "Press P to unpause",
      this.pos.add(new Vector(0, 75)),
      "bold 75px sans-serif",
      undefined,
      undefined,
      "red"
    );
  }
}
