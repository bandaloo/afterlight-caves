import { Entity, FarEnum } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Hero } from "./hero.js";
import { getGameTime } from "../modules/gamemanager.js";
import { centeredText, drawShines, polygon } from "./draw.js";

/**
 * An Item is a powerful, game-altering artifact that gives the hero some new
 * power
 */
export class Item extends Entity {
  /**
   * constructs a new item
   * @param {Vector} pos
   * @param {string} itemName short name of this item
   * @param {string} description explanation of what the item does
   * @param {number} points the number of points this is worth
   * @param {string} symbol a character to represent this item
   * @param {number} numParts the number of parts the hero must collect to
   * obtain this item
   */
  constructor(
    pos = new Vector(0, 0),
    itemName = "Null Item",
    description = "This Item is a mystery",
    points = 500,
    symbol = "?",
    numParts = 3
  ) {
    super(pos);
    this.itemName = itemName;
    this.description = description;
    this.farType = FarEnum.deactivate;
    this.width = 60;
    this.height = 60;
    this.points = points;
    this.symbol = symbol;
    this.numParts = numParts;
    this.type = "Item";
    this.shines = new Array(11);
    this.color = "white";
    for (let i = 0; i < 11; ++i) {
      this.shines[i] = {
        angle: Math.random() * 2 * Math.PI,
        width: 0.35 + Math.random() * 0.2,
        length: 40 + Math.floor(Math.random() * 25),
        speed: 0.01 + Math.random() * 0.03
      };
    }
  }

  /**
   * applies this item to the hero
   * @param {Hero} hero
   */
  apply(hero) {
    hero.addPoints(this.points);
    // increase the number of parts of this type the hero has
    let parts = 1;
    if (hero.itemParts.has(this.itemName)) {
      parts = hero.itemParts.get(this.itemName) + 1;
    }
    if (parts === Infinity) return; // already has the effect
    if (parts >= this.numParts) {
      // hero has all the pieces now
      parts = Infinity;
      this.addEffect(hero);
    }
    hero.itemParts.set(this.itemName, parts);
  }

  /**
   * apply the effect of getting the item (i.e. collecting all parts)
   * @param {Hero} hero
   * @virtual
   */
  addEffect(hero) {}

  /**
   * @override
   */
  draw() {
    drawShines(this.drawPos, this.shines, this.color);
    polygon(
      this.drawPos,
      32,
      this.width,
      this.height,
      getGameTime() / 1000,
      "black",
      this.color,
      5,
      n =>
        1 +
        0.2 *
        Math.cos(
          n * Math.floor(2 + 5 * Math.abs(Math.sin(getGameTime() / 300))) +
          getGameTime() / 100
        )
    );
    centeredText(
      this.symbol,
      this.drawPos.add(new Vector(2, 16)),
      "bold 50px anonymous",
      "center",
      "alphabetic",
      this.color
    );
  }

  /**
   * @override
   */
  action() {
    this.color = `hsl(${Math.floor(getGameTime() / 10) % 360}, 70%, 70%)`;
    // rotate shines
    for (const s of this.shines) {
      s.angle += s.speed;
      if (s.angle > 2 * Math.PI) s.angle -= 2 * Math.PI;
    }
  }
}
