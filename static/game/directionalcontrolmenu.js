import { Directional, getUsingKeyboard, getNextKey } from "../modules/buttons.js";
import { getScreenDimensions } from "../modules/displaymanager.js";
import { toggleGuiElement } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
import { Menu } from "./menu.js";

export class DirectionalControlMenu extends Menu {
  /**
   * @param {Directional} directional the directional to rebind the controls for
   */
  constructor(directional) {
    const screenDimensions = getScreenDimensions();
    super(new Vector(0, 0), screenDimensions.width, screenDimensions.height);
    this.directional = directional;
    this.itemWidth = 1200;
    this.textAlign = "left";
  }

  action() {
    const items = [];
    if (getUsingKeyboard()) {
      for (const b of this.directional.getButtons()) {
        items.push({
          text: b.name + "\t" + b.key,
          func: () => {
            b.key = "Press a key...";
            getNextKey().then(newKey => {
              b.key = newKey;
            });
          }
        });
      }
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
    toggleGuiElement("controlsmenu");
  }
}
