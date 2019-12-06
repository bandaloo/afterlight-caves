import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredText } from "./draw.js";

export class TextDisplay extends Entity {
  /**
   *
   * @param {string} text text to display
   * @param {Vector} pos
   * @param {number} [duration] amount of time this text display lasts in game
   * @param {number} [hue] hsl hue
   * @param {string | CanvasGradient} [strokeStyle] default "black"
   * @param {string} [font] default "bold 100px arial"
   * steps before fading. Default = Infinity
   */
  constructor(
    text,
    pos,
    duration = Infinity,
    hue = 0,
    strokeStyle = "black",
    font = "bold 100px arial"
  ) {
    super(pos);
    this.type = "TextDisplay";
    this.text = text;
    this.hue = hue;
    this.strokeStyle = strokeStyle;
    this.font = font;
    this.duration = duration;
    this.opacity = 1; // for fadeout
  }

  /**
   * draws this TextDisplay
   * @override
   */
  draw() {
    if (this.duration < 60) {
      this.opacity -= 1 / 60;
    }
    centeredText(
      this.text,
      this.drawPos,
      "hsla(" + this.hue + ", 100%, 50%, " + this.opacity + ")",
      this.strokeStyle,
      this.font
    );
    this.duration--;

    if (this.duration <= 0) {
      this.deleteMe = true;
    }
  }
}
