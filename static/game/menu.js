import { GuiElement } from "../modules/guielement.js";
import { Vector } from "../modules/vector.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions
} from "../modules/displaymanager.js";
import { buttons } from "../modules/buttons.js";
import { roundedRect, centeredText } from "./draw.js";
import { clamp } from "../modules/helpers.js";

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
    this.itemFillStyle = "#101010";
    this.selectedFillStyle = "#202020";
    this.downFillStyle = "#303030";
    this.itemStrokeStyle = "black";
    this.itemStrokeWidth = 4;
    this.itemBorderRadius = 0;
    this.itemHeight = 70;
    this.itemWidth = this.width;
    this.textStyle = "bold 50px anonymous";
    this.textAlign = "center";
    this.textFillStyle = "white";
    this.itemMargin = 10;
    this.index = 0;
    this.keyDelay = 40;
    this.keyRate = 8;
    this.keyCounter = 0;
    this.keyRepeated = false;
    this.down = false;
    this.lerpVal = 0;

    this.topPos = undefined;
    this.bottomPos = undefined;
    this.currentPos = undefined;
  }

  /**
   * we need this because items isn't initialized in the constructor
   * @param {{ text: string; func: () => void; }[]} items
   */
  setItems(items) {
    this.items = items;
    this.updateTopAndBottomPos();
  }

  calcMiddle() {
    return this.pos.y + this.height / 2;
  }

  calcTopOffset() {
    return -this.index * (this.itemMargin + this.itemHeight);
  }

  calcBottomOffset() {
    return (
      (this.items.length - this.index) * (this.itemMargin + this.itemHeight) -
      this.itemMargin
    );
  }

  /**
   * calculate where the top should be given the bottom
   * @param {number} bottom
   */
  calcTopFromBottom(bottom) {
    return bottom - this.calcBottomOffset() + this.calcTopOffset();
  }

  updateTopAndBottomPos() {
    const middle = this.calcMiddle();

    this.topPos = middle + this.calcTopOffset();
    console.log("top pos " + this.topPos);

    this.bottomPos = middle + this.calcBottomOffset();
    console.log("bottom pos " + this.bottomPos);
    /*
    this.bottomPos =
      this.topPos +
      this.index * (this.itemMargin + this.itemHeight) +
      (this.items.length - this.index) * (this.itemMargin + this.itemHeight) -
      this.itemMargin;
    */
    // adjust so that selected element is always centered
    this.offsetPos = this.topPos;
    const { height } = getScreenDimensions();
    let overTop = false;
    let overBottom = false;
    if (this.topPos > 0) {
      // clamp to top
      overTop = true;
    }
    if (this.bottomPos < height) {
      // clamp to bottom
      overBottom = true;
    }

    if (overTop && overBottom) {
      // too small to clamp
      this.offsetPos = this.calcMiddle();
    } else if (overTop) {
      this.offsetPos = 0;
    } else if (overBottom) {
      this.offsetPos = this.calcTopFromBottom(height);
    }
  }

  /**
   * Called each step, reads buttons to move up/down or execute
   * @override
   */
  action() {
    this.lerpVal *= 0.9;
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
    this.index = clamp(this.index, 0, this.items.length - 1);
    const prevPos = this.offsetPos;
    this.updateTopAndBottomPos();
    const currPos = this.offsetPos;
    this.lerpVal = prevPos - currPos;
  }

  /**
   * draws this menu
   * TODO some animations here would be nice
   * @override
   */
  draw() {
    const x = this.pos.x + this.itemMargin;
    let y = this.offsetPos;

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
        new Vector(
          x + (this.width - this.itemWidth) / 2,
          y + downOffset + this.lerpVal
        ),
        this.itemWidth,
        this.itemHeight,
        style,
        this.itemStrokeStyle,
        this.itemStrokeWidth,
        this.itemBorderRadius
      );
      this.drawText(x, y + this.lerpVal + downOffset, this.items[i].text);
      y += this.itemHeight + this.itemMargin;
    }
  }

  /**
   * draws text at the right location
   * @param {number} x
   * @param {number} y
   * @param {string} text
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
