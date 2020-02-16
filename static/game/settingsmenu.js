import { Menu } from "./menu.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions,
} from "../modules/displaymanager.js";
import {
  toggleGuiElement
} from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { rect, centeredText } from "./draw.js";
import { settings } from "./settings.js";

export class SettingsMenu extends Menu {
  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.itemWidth = 1200;
    this.textAlign = "left";
  }

  action() {
    const items = [];

    for (const key in settings) {
      items.push({ 
        text: key + "\t" + settings[key].value,
        func: settings[key].onClick.bind(settings[key])
      });
    }
    this.setItems(items);
    super.action();
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
   * @override because canvas doesn't draw tabs. This is a dumb hack to draw the
   * second tabular item right-aligned
   * @param {number} x
   * @param {number} y
   * @param {string} text
   */
  drawText(x, y, text) {
    const tabs = text.split("\t");
    super.drawText(x, y, tabs[0]);
    if (tabs[1] !== undefined) {
      centeredText(
        tabs[1], 
        new Vector(
          x + this.width / 2 - this.itemMargin + this.itemWidth / 2,
          y + this.itemHeight / 2
        ),
        this.textStyle,
        "right",
        "middle",
        this.textFillStyle
      );
    }
  }

  /**
   * @override
   */
  onBack() {
    super.onBack();
    toggleGuiElement("pausescreen");
  }
}
