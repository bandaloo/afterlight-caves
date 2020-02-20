import { Cone } from "../game/powerups/cone.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle, polygon } from "./draw.js";
import { Enemy } from "./enemy.js";
import { randomNormalVec } from "../modules/helpers.js";
import { ChanceTable } from "../modules/chancetable.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
const chanceTable = new ChanceTable();
chanceTable.addAll([
  { result: PowerUpTypes.Amplify, chance: 1 },
  { result: PowerUpTypes.Cone, chance: 0.5 },
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.Elastic, chance: 1 },
  { result: PowerUpTypes.FlameThrower, chance: 1 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Icy, chance: 1 },
  { result: PowerUpTypes.Left, chance: 1 },
  { result: PowerUpTypes.QuickShot, chance: 1 },
  { result: PowerUpTypes.Right, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Wall, chance: 1 },
  { result: PowerUpTypes.Xplode, chance: 0.5 },
  { result: PowerUpTypes.Yeet, chance: 1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);

export class Scatter extends Enemy {
  /**
   * constructs a scatter enemy
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   * @param {number} level
   */
  constructor(
    pos,
    vel,
    acc,
    matryoshka,
    level,
    powerUpTable = SCATTER_CHANCE_TABLE
  ) {
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 10;
    this.initHealth();
    new Cone(2).apply(this);
    this.bulletSpeed = 5;
    this.bulletLifetime = 300;
    this.fireDelay = 0;
    this.basePoints = 50;
    this.level = 1;
  }

  destroy() {
    const vecToHero = getImportantEntity("hero")
      .pos.sub(this.pos)
      .norm2();
    this.shoot(vecToHero, undefined, 50);
    super.destroy();
  }

  action() {
    super.action();
    if (Math.random() < 0.01) {
      const acc = randomNormalVec().mult(0.1);
      this.acc = acc.mult(this.movementMultiplier);
    }
  }

  drawBody() {
    const sides = 3;
    const bgColor = this.getBackgroundColor();
    polygon(
      this.drawPos,
      sides,
      this.width,
      this.height,
      Math.atan2(this.vel.y, this.vel.x),
      bgColor,
      this.drawColor
    );
  }

  drawFace() {
    const drawEye = (scalar, offset) => {
      circle(
        this.drawPos.add(offset),
        scalar,
        "rgba(0, 0, 0, 0)",
        4,
        this.drawColor
      );
    };

    const vecToHero = getImportantEntity("hero")
      .pos.sub(this.drawPos)
      .norm2();

    drawEye(8, vecToHero.mult(10));
    drawEye(16, new Vector(0, 0));
  }
}
