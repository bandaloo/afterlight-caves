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
  /** @type {{text: string, func: () => void | undefined}[]} */
  items;
  /** @type {number} index of currently selected item */
  index;
  /** @type {string | CanvasPattern | CanvasGradient} */
  itemFillStyle;
  /** @type {string | CanvasPattern | CanvasGradient} */
  selectedFillStyle;
  /**
   * @type {string | CanvasPattern | CanvasGradient} when you're holding down
   * the select button
   */
  downFillStyle;
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
  /** @type {number} items are centered in overall width */
  itemWidth;
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
  /** @type boolean primary button being held */
  down;

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
    this.selectedFillStyle = "#0000ff";
    this.downFillStyle = "#4444cc";
    this.itemStrokeStyle = "black";
    this.itemStrokeWidth = 4;
    this.itemBorderRadius = 0;
    this.itemHeight = 70;
    this.itemWidth = this.width;
    this.textStyle = "bold 50px sans-serif";
    this.textAlign = "center";
    this.textFillStyle = "white";
    this.itemMargin = 10;
    this.index = 0;
    this.keyDelay = 40;
    this.keyRate = 8;
    this.keyCounter = 0;
    this.keyRepeated = false;
    this.down = false;
  }

  /**
   * Called each step, reads buttons to move up/down or execute
   * @override
   */
  action() {
    if (buttons.back.status.isReleased) {
      // Fixes a bug where the button being released was seen by multiple menus
      // at once. You should press it multiple times to close multiple menus
      buttons.back.status.isReleased = false;
      this.onBack();
    }
    this.down = buttons.select.status.isDown;
    if (buttons.select.status.isReleased) {
      if (this.items[this.index] && this.items[this.index].func !== undefined)
        this.items[this.index].func();
    }
    const navDir = buttons.move.vec.add(buttons.shoot.vec);
    // key repeat logic
    if (Math.abs(navDir.y) < 0.25) {
      // not being pressed, reset counter
      this.keyCounter = 0;
      this.keyRepeated = false;
    } else if (!this.down && this.keyCounter <= 0) {
      // move up/down based on direction of move directional
      this.keyCounter = this.keyRepeated ? this.keyRate : this.keyDelay;
      if (navDir.y < -0.25) {
        this.move(-1);
        this.keyRepeated = true;
      } else if (navDir.y > 0.25) {
        this.move(1);
        this.keyRepeated = true;
      }
    }
    this.keyCounter--;
  }

  /**
   * moves up or down
   * @param {number} num number of items to move (positive or negative)
   */
  move(num) {
    this.index += num;
    if (this.index >= this.items.length) this.index = this.items.length - 1;
    if (this.index < 0) this.index = 0;
  }

  /**
   * draws this menu
   * TODO some animations here would be nice
   * @override
   */
  draw() {
    const x = this.pos.x + this.itemMargin;
    // adjust so that selected element is always centered
    let y =
      this.pos.y +
      this.height / 2 -
      this.index * (this.itemMargin + this.itemHeight);
    // adjust y if the selected element is off the screen
    for (let i = 0; i < this.items.length; ++i) {
      let downOffset = 0;
      let style = this.itemFillStyle;
      if (i === this.index) {
        style = this.selectedFillStyle;
        if (this.down) {
          style = this.downFillStyle;
          downOffset += 3;
        }
      }
      roundedRect(
        new Vector(x + (this.width - this.itemWidth) / 2, y + downOffset),
        this.itemWidth,
        this.itemHeight,
        style,
        this.itemStrokeStyle,
        this.itemStrokeWidth,
        this.itemBorderRadius
      );
      this.drawText(x, y + downOffset, this.items[i].text);
      y += this.itemHeight + this.itemMargin;
    }
  }

  /**
   * draws text at the right location
   */
  drawText(x, y, text) {
    let textOffset = 0;
    switch (this.textAlign) {
      case "left":
        textOffset = -0.5 * this.itemWidth;
        break;
      case "right":
        textOffset = 0.5 * this.itemWidth;
        break;
    }
    centeredText(
      text,
      new Vector(
        x + this.width / 2 + this.itemMargin + textOffset,
        y + this.itemHeight / 2
      ),
      this.textStyle,
      this.textAlign,
      "middle",
      this.textFillStyle,
      undefined,
      undefined
    );
  }

  /**
   * By default pressing 'back' closes the menu, but can be overriden
   */
  onBack() {
    this.active = false;
  }
}
