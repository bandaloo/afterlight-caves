import { Menu } from "./menu.js";
import { Vector } from "../modules/vector.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  toggleGuiElement,
  getScreenDimensions
} from "../modules/gamemanager.js";
import { powerUpTypes } from "./powerups/poweruptypes.js";
import { rect } from "./draw.js";

export class Codex extends Menu {
  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.items = powerUpTypes.map(powerUpType => {
      const pu = new powerUpType();
      return { text: pu.powerUpClass + "\t" + pu.description, func: undefined };
    });
    this.itemWidth = 1500;
    this.itemFillStyle = "rgba(0, 0, 0, 0)";
    this.selectedFillStyle = "rgba(20, 20, 255, 1)";
    this.itemStrokeStyle = "rgba(0, 0, 0, 0)";
    this.textAlign = "left";
    this.textStyle = "50px sans-serif";
  }

  /**
   * @override
   */
  draw() {
    const screenDimensions = getScreenDimensions();
    rect(
      new Vector(0, 0),
      screenDimensions.width,
      screenDimensions.height,
      "rgba(0,0,0,.9)"
    );
    super.draw();
  }

  /**
   * @override because canvas doesn't draw tabs. This is a dumb hack
   */
  drawText(x, y, text) {
    const tabs = text.split("\t");
    super.drawText(x, y, tabs[0]);
    if (tabs[1] !== undefined) super.drawText(x + 400, y, tabs[1]);
  }

  /**
   * @override
   */
  onBack() {
    super.onBack();
    toggleGuiElement("pausescreen");
  }
}
