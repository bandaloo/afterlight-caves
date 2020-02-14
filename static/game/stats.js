import { Menu } from "./menu.js";
import { Vector } from "../modules/vector.js";
import {
  getImportantEntity,
  toggleGuiElement
} from "../modules/gamemanager.js";
import { rect } from "./draw.js";
import { Hero } from "./hero.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions
} from "../modules/displaymanager.js";

export class Stats extends Menu {
  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.itemWidth = 500;
    this.itemFillStyle = "rgba(0, 0, 0, 0)";
    this.selectedFillStyle = "rgba(20, 20, 255, 1)";
    this.itemStrokeStyle = "rgba(0, 0, 0, 0)";
    /** @type {CanvasTextAlign} */
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
   * @override
   */
  action() {
    this.items = [];
    const hero = /** @type {Hero} */ (getImportantEntity("hero"));
    if (hero === undefined || hero === null) return;
    hero.powerUps.forEach((mag, name) => {
      this.items.push({ text: name + "\t" + mag, func: undefined });
    });
    if (this.items.length === 0) {
      this.items = [{ text: "No power ups yet", func: undefined }];
    }
    super.action();
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
