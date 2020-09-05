import { GuiElement } from "../modules/guielement.js";
import { getGameTime, getImportantEntity } from "../modules/gamemanager.js";
import { centeredText } from "./draw.js";
import { Vector } from "../modules/vector.js";
import { itemSymbols } from "./items/itemtypes.js";

export class ItemDisplay extends GuiElement {
  /** @type {Hero} */
  hero;
  /** @type {Map<string, number>} */
  itemParts;

  /**
   * @param {Vector} pos
   */
  constructor(pos) {
    super(pos);
  }

  action() {
    this.hero = /** @type {Hero} */ (getImportantEntity("hero"));
    this.itemParts = this.hero.itemParts;
  }

  draw() {
    if (this.itemParts === null || this.itemParts === undefined) return;
    let offset = 0;
    for (const itemType of this.itemParts) {
      const info = itemSymbols.get(itemType[0]);
      const outlineColor = (itemType[1] === Infinity)
        ? `hsl(${Math.floor(getGameTime() / 10) % 360}, 70%, 70%)`
        : "rgba(255, 255, 255, 0.4)";
      centeredText(
        info.symbol.repeat(info.max),
        this.pos.add(new Vector(0, offset)),
        "bold 60px anonymous",
        "right",
        undefined,
        outlineColor
      );
      if (itemType[1] !== Infinity) {
        centeredText(
          info.symbol.repeat(itemType[1]),
          this.pos.add(new Vector(0, offset)),
          "bold 60px anonymous",
          "right",
          undefined,
          "rgba(255, 255, 255, 1)"
        );
      }
      offset -= 60;
    }
  }
}
