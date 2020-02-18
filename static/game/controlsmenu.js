import {
  buttons,
  getNextGamepadButton,
  getNextKey,
  getUsingKeyboard
} from "../modules/buttons.js";
import { getScreenDimensions } from "../modules/displaymanager.js";
import { toggleGuiElement, addToGui } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
import { Menu } from "./menu.js";
import {DirectionalControlMenu} from "./directionalcontrolmenu.js";

export class ControlsMenu extends Menu {
  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(0, 0), screenDimensions.width, screenDimensions.height);
    this.itemWidth = 1200;
    this.textAlign = "left";
    // make a sub-menu for each directional
    this.childMenus = [];
    for (const dir of buttons.getDirectionals()) {
      const dcm = new DirectionalControlMenu(dir);
      dcm.active = false;
      addToGui(dir.name + "controlmenu", dcm);
      this.childMenus.push(dcm);
    }
  }

  action() {
    const items = [];
    for (const directional of buttons.getDirectionals()) {
      items.push({
        text: directional.name,
        func: () => {
          this.active = false;
          toggleGuiElement(directional.name + "controlmenu");
        }
      });
    }

    for (const button of buttons.getButtons()) {
      let displayKey = getUsingKeyboard() ? button.key : button.gpButtonIndex;
      if (displayKey === " ") displayKey = "Space";
      items.push({
        text: button.name + "\t" + displayKey,
        func: () => {
          if (getUsingKeyboard()) {
            button.key = "Press a key...";
            getNextKey().then(newKey => {
              button.key = newKey;
            });
          } else {
            const oldKey = button.key;
            button.key = "Press a button...";
            getNextGamepadButton().then(newIndex => {
              button.gpButtonIndex = newIndex;
              button.key = oldKey;
            });
          }
        }
      });
    }
    this.setItems(items);
    super.action();
  }

  /**
   * @override
   */
  draw() {
    rect(new Vector(0, 0), this.width, this.height, "rgba(0,0,0,.9)");
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
