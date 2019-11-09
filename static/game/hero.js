import { Entity } from '../modules/entity.js';
import { Vector } from '../modules/vector.js';
import { drawCircle } from '../modules/helpers.js';

export class Hero extends Entity {
  /**
   * @param startingPos {Vector} the starting position of this Hero
   * @constructor
   */
  constructor(startingPos) {
    super (startingPos);
    this.type = "Hero";
    this.width = 50;
    this.height = 50;
    this.drag = 0.1;
  }

  /**
   * Draws the hero at its position in the world
   */
  draw() {
    //console.log("drawpos: " + this.drawPos);
    //console.log("pos: " + this.pos);
    drawCircle(this.drawPos, 20, 'yellow');
  }
}