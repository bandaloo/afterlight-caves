import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { rect, centeredText } from "./draw.js";
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
    rect(
      new Vector(0, 0),
      getScreenDimensions().width,
      getScreenDimensions().height,
      "rgba(0,0,0,.9)"
    );
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
