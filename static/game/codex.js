import { Menu } from "./menu.js";
import { Vector } from "../modules/vector.js";
import { toggleGuiElement } from "../modules/gamemanager.js";
import { powerUpTypes } from "./powerups/poweruptypes.js";
import { rect } from "./draw.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions
} from "../modules/displaymanager.js";

// TODO fix this incorrectly extending from the base class
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
    /** @type {CanvasTextAlign} */
    this.textAlign = "left";
    this.textStyle = "50px anonymous";
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
   * @param {number} x
   * @param {number} y
   * @param {string} text
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
