import { Vector } from "../modules/vector.js";
import { Entity } from "../modules/entity.js";
import { centeredRect, circle } from "./draw.js";
import { getTotalTime, addParticle } from "../modules/gamemanager.js";
import { Hero } from "./hero.js";
import { Particle, EffectEnum } from "./particle.js";

/**
 * @enum {number}
 */
export const PickupEnum = Object.freeze({ bomb: 1, health: 2 });

const POWERUP_LIFETIME = 500;
const POWERUP_DISAPPEARING = 50;
const HEALTH_COLOR = "red";
const BOMB_COLOR = "gray";

export class Pickup extends Entity {
  /**
   * @param {Vector} pos
   * @param {number} pickupEnum
   */
  constructor(pos, pickupEnum) {
    super(pos, new Vector(0, 0), new Vector(0, 0));
    this.width = 32;
    this.height = 32;
    this.pickupType = pickupEnum;
    this.color = pickupEnum === PickupEnum.bomb ? BOMB_COLOR : HEALTH_COLOR;
    this.lifetime = POWERUP_LIFETIME;
    this.collideMap.set("Hero", h => this.getPicked(h));
  }

  draw() {
    const sizeScalar =
      this.lifetime > POWERUP_DISAPPEARING
        ? 1.0
        : this.lifetime / POWERUP_DISAPPEARING;

    const lineWidth = (5 + 2 * Math.sin(getTotalTime() / 100)) * sizeScalar;

    centeredRect(
      this.drawPos,
      this.width * sizeScalar,
      this.height * sizeScalar,
      "black",
      this.color,
      5
    );

    // draw inner element
    if (this.pickupType === PickupEnum.health) {
      centeredRect(
        this.drawPos,
        (this.width / 2) * sizeScalar,
        (this.height / 2) * sizeScalar,
        "black",
        this.color,
        lineWidth
      );
    } else {
      circle(
        this.drawPos,
        (this.width / 4) * sizeScalar,
        "black",
        lineWidth,
        this.color
      );
    }
  }

  /**
   * get picked up by the hero
   * @param {Entity} entity
   */
  getPicked(entity) {
    if (this.pickupType === PickupEnum.bomb) {
      // checking for existance of hero shouldn't be necessary
      /** @type {Hero} */ (entity).addBombs(1);
    } else if (this.pickupType === PickupEnum.health) {
      /** @type {Hero} */ (entity).gainHealth(5);
    }

    for (let i = 0; i < 15; i++) {
      const spark = new Particle(this.pos, this.color, EffectEnum.spark);
      spark.lineWidth = 15;
      spark.multiplier = 8;
      addParticle(spark);
    }

    this.deleteMe = true;
  }
}
