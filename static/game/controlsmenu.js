import {
  buttons,
  getNextGamepadButton,
  getNextKey,
  getUsingKeyboard,
  saveControls
} from "../modules/buttons.js";
import { getScreenDimensions } from "../modules/displaymanager.js";
import { toggleGuiElement, addToGui } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
import { Menu } from "./menu.js";
import { DirectionalControlMenu } from "./directionalcontrolmenu.js";

export class ControlsMenu extends Menu {
  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(0, 0), screenDimensions.width, screenDimensions.height);
    this.itemWidth = 1200;
    this.textAlign = /** @type {CanvasTextAlign} */ ("left");
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
              saveControls();
            });
          } else {
            const oldButton = button.gpButtonIndex;
            // @ts-ignore I know we're assigning a string to a number, but it's
            // okay because we'll assign it back soon
            button.gpButtonIndex = "Press a button...";
            getNextGamepadButton().then(newIndex => {
              if (newIndex === undefined) button.gpButtonIndex = oldButton;
              else button.gpButtonIndex = newIndex;
              saveControls();
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
   * @override
   */
  onBack() {
    saveControls();
    super.onBack();
    toggleGuiElement("pausescreen");
  }
}
