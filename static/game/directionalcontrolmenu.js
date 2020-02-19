import {
  Directional,
  getUsingKeyboard,
  getNextKey,
  getNextStickAxis,
  saveControls
} from "../modules/buttons.js";
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
    this.textAlign = /** @type {CanvasTextAlign} */ ("left");
  }

  action() {
    const items = [];
    if (getUsingKeyboard()) {
      // rebind a key
      for (const b of this.directional.getButtons()) {
        items.push({
          text: b.name + "\t" + b.key,
          func: () => {
            const oldKey = b.key;
            b.key = "Press a key...";
            getNextKey().then(newKey => {
              if (newKey === undefined) b.key = oldKey;
              else b.key = newKey;
              saveControls();
            });
          }
        });
      }
    } else {
      // rebind a stick
      items.push({
        text:
          "Vertical axis\t" +
          (this.directional.invertVAxis ? "-" : "") +
          this.directional.vAxisIndex,
        func: () => {
          const oldIndex = this.directional.vAxisIndex;
          const oldInverse = this.directional.invertVAxis;
          // @ts-ignore I know we're assigning a string to a number, but it's
          // okay because we'll assign it back soon
          this.directional.vAxisIndex = "Move a stick down...";
          this.directional.invertVAxis = false;
          getNextStickAxis().then(obj => {
            if (obj === undefined) {
              this.directional.vAxisIndex = oldIndex;
              this.directional.invertVAxis = oldInverse;
            } else {
              this.directional.vAxisIndex = obj.index;
              this.directional.invertVAxis = obj.inverse;
            }
            saveControls();
          });
        }
      });
      items.push({
        text:
          "Horizontal axis\t" +
          (this.directional.invertHAxis ? "-" : "") +
          this.directional.hAxisIndex,
        func: () => {
          const oldIndex = this.directional.hAxisIndex;
          const oldInverse = this.directional.invertHAxis;
          // @ts-ignore I know we're assigning a string to a number, but it's
          // okay because we'll assign it back soon
          this.directional.hAxisIndex = "Move a stick right...";
          this.directional.invertHAxis = false;
          getNextStickAxis().then(obj => {
            if (obj === undefined) {
              this.directional.hAxisIndex = oldIndex;
              this.directional.invertHAxis = oldInverse;
            } else {
              this.directional.hAxisIndex = obj.index;
              this.directional.invertHAxis = obj.inverse;
            }
            saveControls();
          });
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
    toggleGuiElement("controlsmenu");
  }
}
