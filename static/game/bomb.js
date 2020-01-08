import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredOctagon, centeredCircle } from "./draw.js";

/**
 * This class represents a bomb that creatures can place in the game world,
 * which explodes (usually dealing damage within a radius but could have other
 * effects) after a certain amount of time
 */
export class Bomb extends Entity {
  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a funciton to execute when the bomb detonates
   * @type {{ name: string
   *        , data: number
   *        , func: (function(Bomb, number): void)
   *        }[]}
   */
  onDetonate;

  /**
   * An array of objects, where each object has a name, which is the name of
   * the source of the function, a data, which is some number the function
   * takes, and a func, which is a function to execute when a creature is
   * caught in the blast of the bomb
   * @type {{ name: string
   *        , data: number
   *        , func: function( Bomb
   *                        , number
   *                        , import("./creature.js").Creature
   *                        ): void
   *        }[]}
   */
  onBlastCreature;

  /**
   * @param {Vector} [pos]
   * @param {boolean} [good] true if this bomb was planted by the hero
   * @param {string|CanvasGradient|CanvasPattern} [fillStyle]
   * @param {number} [fuseTime] number of game steps to detonation
   */
  constructor(
    pos = new Vector(0, 0),
    good = false,
    fillStyle = "white",
    fuseTime = 180
  ) {
    super(pos);
    this.good = good;
    this.fillStyle = fillStyle;
    this.fuseTime = fuseTime;
    this.onDetonate = new Array();
    this.onBlastCreature = new Array();
    this.size = 75;
    // amount of time (in game steps) it takes to animate exploding
    this.timeToExplode = 20;
    this.blastRadius = 400;
  }

  /**
   * @override
   */
  action() {
    this.fuseTime--;
    if (this.fuseTime === 0) {
      this.detonate();
    } else if (this.fuseTime < -1 * this.timeToExplode) {
      // done exploding
      // make this entity bigger for the sake of collisions
      this.width = this.blastRadius * 2;
      this.height = this.blastRadius * 2;
      // now set the collide map so that the bomb collides only once before
      // being deleted
      this.collideMap.set(
        this.good ? "Enemy" : "Hero",
        /** @param {import("./creature.js").Creature} creature */ creature => {
          this.onBlastCreature.map(obj => {
            obj.func(this, obj.data, creature);
          });
        }
      );
      this.deleteMe = true;
    }
  }

  /**
   * @override
   */
  draw() {
    if (this.fuseTime > 0) {
      // draw bomb
      centeredOctagon(this.drawPos, this.size, this.fillStyle, "white", 4, 0.5);
      // blinking effect
      // TODO see if we can make this look nicer (and get rid of this gross if)
      if (
        (this.fuseTime >= 480 && this.fuseTime % 180 < 60) ||
        (this.fuseTime < 480 &&
          this.fuseTime >= 240 &&
          this.fuseTime % 120 < 60) ||
        (this.fuseTime < 240 &&
          this.fuseTime >= 90 &&
          this.fuseTime % 60 < 35) ||
        (this.fuseTime < 90 && this.fuseTime % 20 < 10)
      ) {
        centeredOctagon(
          this.drawPos,
          this.size,
          "rgba(255, 255, 255, 0.5)",
          undefined,
          undefined,
          0.5
        );
      }
    } else if (this.fuseTime >= -1 * this.timeToExplode) {
      // draw explosion
      const radius =
        (Math.abs(this.fuseTime) / this.timeToExplode) * this.blastRadius;
      const thickness = (radius / this.blastRadius) * 60;
      centeredCircle(this.drawPos, radius, undefined, thickness, "red");
    }
  }

  /**
   * makes the bomb go kaboom
   */
  detonate() {
    for (const od of this.onDetonate) {
      if (od) od.func(this, od.data);
    }
  }
}
