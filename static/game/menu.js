import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import { getCanvasWidth, getCanvasHeight } from "../modules/gamemanager.js";
import { buttons } from "../modules/buttons.js";
import { roundedRect, centeredText } from "./draw.js";

/**
 * A vertical list of selectable items. Each item has text to display and a
 * function to execute when its is selected
 */
export class Menu extends GuiElement {
  /** @type {number} */
  width;
  /** @type {number} */
  height;
  /** @type {string} explanatory text on the bottom of the screen */
  description;
  /** @type {{text: string, func: () => void | undefined}[]} */
  items;
  /** @type {number} index of currently selected item */
  index;
  /** @type {string | CanvasPattern | CanvasGradient} */
  itemFillStyle;
  /** @type {string | CanvasPattern | CanvasGradient} */
  selectedFillStyle;
  /** @type {string | CanvasPattern | CanvasGradient} */
  itemStrokeStyle;
  /** @type {number} */
  itemStrokeWidth;
  /** @type {number} */
  itemBorderRadius;
  /** @type {string} */
  textStyle;
  /** @type {CanvasTextAlign} */
  textAlign;
  /** @type {string | CanvasPattern | CanvasGradient} */
  textFillStyle;
  /** @type {number} in pixels */
  itemHeight;
  /** @type {number in pixels */
  itemMargin;
  /**
   * @type {number}
   * number of game steps between when a button is first pressed and when it
   * starts repeating
   */
  keyDelay;
  /** @type {number} number of game steps between key repeats */
  keyRate;
  /** @type {number} counter used for key repeat measurements */
  keyCounter;
  /** @type {boolean} */
  keyRepeated;



  /**
   * @param {Vector} pos top-left position
   * @param {number} width total width of this menu
   * @param {number} height total height of this menu
   * @param {{text: string, func: () => void | undefined}[]} items
   */
  constructor(
    pos = new Vector(0, 0),
    width = getCanvasWidth(),
    height = getCanvasHeight(),
    items = []
  ) {
    super(pos);
    this.width = width;
    this.height = height;
    this.items = items;
    this.itemFillStyle = "green";
    this.selectedFillStyle = "blue";
    this.itemStrokeStyle = "black";
    this.itemStrokeWidth = 4;
    this.itemBorderRadius = 0;
    this.itemHeight = 70;
    this.textStyle = "bold 50px sans-serif";
    this.textAlign = "center";
    this.textFillStyle = "white";
    this.itemMargin = 10;
    this.index = 0;
    this.keyDelay = 40;
    this.keyRate = 8;
    this.keyCounter = 0;
    this.keyRepeated = false;
  }

  /**
   * Called each step, reads buttons to move up/down or execute
   * @override
   */
  action() {
    // key repeat logic
    if (this.keyCounter <= 0) {
      // move up/down based on direction of move directional
      const navDir = buttons.move.vec;
      if (!navDir.isZeroVec()) {
        this.keyCounter = this.keyRepeated ? this.keyRate : this.keyDelay;
        if (navDir.y < -0.25) {
          this.move(-1);
          this.keyRepeated = true;
        } else if (navDir.y > 0.25) {
          this.move(1);
          this.keyRepeated = true;
        }
      } else {
        this.keyRepeated = false;
      }
    }
    this.keyCounter--;
  }

  /**
   * moves up or down
   * @param {number} num number of items to move (positive or negative)
   */
  move(num) {
    this.index += num
    if (this.index >= this.items.length) this.index = this.items.length - 1;
    if (this.index < 0) this.index = 0;
  }

  /**
   * draws this menu
   * @override
   */
  draw() {
    const x = this.pos.x + this.itemMargin;
    let y = this.pos.y + this.itemMargin;
    for (let i = 0; i < this.items.length; ++i) {
      roundedRect(
        new Vector(x, y),
        this.width - this.itemMargin * 2,
        this.itemHeight,
        i === this.index ? this.selectedFillStyle : this.itemFillStyle,
        this.itemStrokeStyle,
        this.itemStrokeWidth,
        this.itemBorderRadius
      );
      centeredText(
        this.items[i].text,
        new Vector(
          x + this.width / 2 + this.itemMargin,
          y + (this.itemHeight / 2)
        ),
        this.textStyle,
        this.textAlign,
        "middle",
        this.textFillStyle,
        undefined,
        undefined
      );
      y += this.itemHeight + this.itemMargin;
    }
  }
}
