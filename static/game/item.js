import { Entity, FarEnum } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { Hero } from "./hero.js";

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
   */
  constructor(
    pos = new Vector(0, 0),
    itemName = "Null Item",
    description = "This Item is a mystery",
    points = 500
  ) {
    super(pos);
    this.itemName = itemName;
    this.description = description;
    this.farType = FarEnum.deactivate;
    this.width = 60;
    this.height = 60;
    this.points = points;
    this.type = "Item";
  }

  /**
   * applies this item to the hero
   * @param {Hero} hero 
   * @virtual
   */
  apply(hero) {
    hero.addPoints(this.points);
  }
}
