import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";

export class TextDisplay extends Entity {
  /**
   *
   * @param {string} text text to display
   * @param {Vector} pos
   * @param {number} [duration] amount of time this text display lasts in game
   * steps before fading. Default = Infinity
   * @param {string} [font] default "bold 100px arial"
   * @param {number} [hue] hsl hue
   * @param {string|CanvasGradient|CanvasPattern} [strokeStyle] leave undefined
   * for no outline
   * @param {number} [lineWidth]
   */
  constructor(
    text,
    pos,
    duration = Infinity,
    font = "bold 100px arial",
    hue = 0,
    strokeStyle,
    lineWidth
  ) {
    super(pos);
    this.type = "TextDisplay";
    this.text = text;
    this.hue = hue;
    this.strokeStyle = strokeStyle;
    this.lineWidth = lineWidth,
    this.font = font;
    this.duration = duration;
    this.align =
      /** @type {CanvasTextAlign} */ ("center");
    this.baseline = 
      /** @type {CanvasTextBaseline} */ ("alphabetic");
    this.opacity = 1; // for fadeout
  }

  /**
   * steps down the duration until this disappears
   * @override
   */
  action() {
    // fade out in the last second of existence
    if (this.duration < 60) {
      this.opacity -= 1 / 60;
    }
    if (--this.duration <= 0) {
      this.deleteMe = true;
    }
  }

  /**
   * draws this TextDisplay
   * @override
   */
  draw() {
    centeredText(
      this.text,
      this.drawPos,
      this.font,
      this.align,
      this.baseline,
      `hsla(${this.hue}, 100%, 50%, ${this.opacity})`,
      this.strokeStyle,
      this.lineWidth
    );
  }
}
