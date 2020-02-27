import { Item } from "../item.js";
import { Vector } from "../../modules/vector.js";
import { Hero } from "../hero.js";
import { Beam } from "../bullet.js";
import {
  centeredRect,
  polygon,
  circle,
  drawShines,
  centeredText
} from "../draw.js";
import { getGameTime } from "../../modules/gamemanager.js";

/**
 * Collecting the Positron Rifle replaces your regular bullets with a powerful
 * beam attack
 */
export class PositronRifle extends Item {
  /**
   * @param {Vector} pos
   */
  constructor(pos = new Vector(0, 0)) {
    super(pos, "Positron Rifle", "Fire a devastating beam", 500);

    this.shines = new Array(10);
    for (let i = 0; i < 10; ++i) {
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
   * @override
   */
  apply(hero) {
    hero.positronParts++;
    // if you have all parts give the hero the beam
    if (hero.positronParts === 3) {
      hero.bulletType = Beam;
      hero.fireDelay += 100;
      hero.bulletLifetime = Math.max(50, hero.bulletLifetime - 200);
    }
  }

  /**
   * @override
   */
  draw() {
    // TODO figure out better way to do this
    for (const s of this.shines) {
      s.angle += s.speed;
      if (s.angle > 2 * Math.PI) s.angle -= 2 * Math.PI;
    }
    const color = `hsl(${Math.floor(getGameTime() / 10) % 360}, 70%, 70%)`;
    drawShines(this.drawPos, this.shines, color);
    polygon(
      this.drawPos,
      32,
      this.width,
      this.height,
      getGameTime() / 1000,
      "black",
      color,
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
      "!",
      this.drawPos.add(new Vector(2, 16)),
      "bold 50px anonymous",
      "center",
      "alphabetic",
      color
    );
  }
}
