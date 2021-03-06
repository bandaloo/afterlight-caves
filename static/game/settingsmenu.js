import { Menu } from "./menu.js";
import {
  getCanvasHeight,
  getCanvasWidth,
  getScreenDimensions
} from "../modules/displaymanager.js";
import { toggleGuiElement } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { rect } from "./draw.js";
import { saveSettings, settings } from "./settings.js";

export class SettingsMenu extends Menu {
  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.itemWidth = 1200;
    this.textAlign = /** @type {CanvasTextAlign} */ ("left");
  }

  action() {
    const items = [];

    for (const key in settings) {
      items.push({
        text: key + "\t" + settings[key].getDisplayVal.apply(settings[key]),
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
   * @override
   */
  onBack() {
    saveSettings();
    super.onBack();
    toggleGuiElement("pauseScreen");
  }
}
