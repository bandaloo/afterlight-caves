import { Entity } from "../modules/entity.js";
import { Vector } from "../modules/vector.js";
import { centeredOctagon, circle } from "./draw.js";
import { Particle, EffectEnum } from "./particle.js";
import { addParticle } from "../modules/gamemanager.js";

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
   * @param {number} [hue] HSL hue for this bomb's color
   * @param {number} [fuseTime] number of game steps to detonation
   */
  constructor(pos = new Vector(0, 0), good = false, hue = 0, fuseTime = 180) {
    super(pos);
    this.good = good;
    this.fuseTime = fuseTime;
    this.onDetonate = new Array();
    this.onBlastCreature = new Array();
    this.width = 75;
    this.height = 75;
    // amount of time (in game steps) it takes to animate exploding
    this.timeToExplode = 20;
    this.blastRadius = 300;
    this.hue = hue;
    this.speed = 0;
    /** @type {import("./creature.js").Creature} */
    this.owner = undefined; // the creature that created this bomb
  }

  /**
   * @override
   */
  action() {
    this.fuseTime--;
    if (this.fuseTime === 0) {
      this.detonate();
    } else if (this.fuseTime < 0 && this.fuseTime >= -1 * this.timeToExplode) {
      // currently exploding
      // make this entity bigger for the sake of collisions
      const radius =
        (Math.abs(this.fuseTime) / this.timeToExplode) * this.blastRadius;
      this.width = radius * 2;
      this.height = radius * 2;
    } else if (this.fuseTime < -1 * this.timeToExplode) {
      // done exploding
      this.deleteMe = true;
    }
  }

  /**
   * @override
   */
  draw() {
    if (this.fuseTime > 0) {
      // draw bomb
      centeredOctagon(
        this.drawPos,
        this.width,
        `hsl(${this.hue}, 100%, 25%)`,
        "white",
        4,
        0.5
      );
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
          this.width,
          "rgba(255, 255, 255, 0.5)",
          undefined,
          undefined,
          0.5
        );
      }
    } else if (this.fuseTime >= -1 * this.timeToExplode) {
      // create some particles
      const numParticles = Math.floor(Math.random() * 20) + 6;
      for (let i = 0; i < numParticles; ++i) {
        let particleHue = (this.hue - 30 + Math.random() * 30) % 360;
        let color = `hsl(${particleHue}, 100%, 50%)`;
        const xOffset = (Math.random() * this.width - this.width / 2) / 2;
        const yOffset = (Math.random() * this.height - this.height / 2) / 2;
        const p = new Particle(
          new Vector(this.drawPos.x + xOffset, this.drawPos.y + yOffset),
          color,
          EffectEnum.spark,
          5,
          5,
          0.04,
          80,
          40,
          new Vector(0, 0)
        );
        const diff = p.drawPos.sub(this.drawPos);
        let theta = Math.atan(diff.y / diff.x);
        if (diff.x < 0) theta += Math.PI; // account for left-facing diff
        const r = 10 + 1 / diff.mag() + 0.2;
        p.vel = new Vector(r * Math.cos(theta), r * Math.sin(theta));
        p.strokeStyle = "white";
        p.lineWidth = 8;
        p.width = 20;
        p.height = 20;
        addParticle(p);
      }
      // draw explosion
      const radius =
        (Math.abs(this.fuseTime) / this.timeToExplode) * this.blastRadius;
      const thickness = (radius / this.blastRadius) * 60;
      circle(
        this.drawPos,
        radius,
        undefined,
        thickness,
        `hsl(${this.hue}, 100%, 50%)`
      );
    }
  }

  /**
   * makes the bomb go kaboom
   */
  detonate() {
    this.collidesWithWalls = false;
    for (const od of this.onDetonate) {
      if (od) od.func(this, od.data);
    }
    this.collideMap.set(
      this.good ? "Enemy" : "Hero",
      /** @param {import("./creature.js").Creature} creature */ creature => {
        // deal damage only every 1/2 second or at the very end of the explosion
        if (
          this.fuseTime === -1 * this.timeToExplode ||
          this.fuseTime % 30 === 0
        ) {
          this.onBlastCreature.map(obj => {
            obj.func(this, obj.data, creature);
          });
        }
      }
    );
  }
}
