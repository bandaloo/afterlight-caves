import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { polygon } from "./draw.js";
import { ChanceTable } from "../modules/chancetable.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
const chanceTable = new ChanceTable();
chanceTable.addAll([
  { result: PowerUpTypes.Amplify, chance: 1 },
  { result: PowerUpTypes.Cone, chance: 10 },
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.Elastic, chance: 2 },
  { result: PowerUpTypes.FlameThrower, chance: 1 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Icy, chance: 1 },
  { result: PowerUpTypes.Left, chance: 1 },
  { result: PowerUpTypes.QuickShot, chance: 1 },
  { result: PowerUpTypes.Right, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Wall, chance: 1 },
  { result: PowerUpTypes.Xplode, chance: 2 },
  { result: PowerUpTypes.Yeet, chance: 1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);

/**
 * alternately shoots bullets at 45 degrees and in cardinal directions. has no
 * movement AI but can be knocked around, which creates interesting scenarios.
 * more of a turret, so it doesn't have a face
 */
export class Crosser extends Enemy {
  /**
   * constructs a crosser entity
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   * @param {number} level
   */
  constructor(pos, vel, acc, matryoshka, level, powerUpTable = chanceTable) {
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 20;
    this.initHealth();
    this.basePoints = 60;

    // stuff for shooting
    this.fireDelay = 90;
    this.bulletSpeed = 3;
    this.bulletLifetime = 300;
    this.wiggleCount = 0;
    this.diagonalMod = 0;
    this.bulletsPerShot = 4;
  }

  action() {
    super.action();
    const section = 360 / this.bulletsPerShot;
    if (
      this.shoot(
        new Vector(1, 0),
        this.vel,
        360 - section,
        (section / 2) * this.diagonalMod
      )
    ) {
      this.diagonalMod ^= 1; // flip 0 -> 1 and 1 -> 0
    }
    this.wiggleCount++;
  }

  drawBody() {
    const sides = this.bulletsPerShot * 2;
    for (let i = 0; i < 2; i++) {
      polygon(
        this.drawPos,
        sides,
        this.width * 1.2,
        this.height * 1.2,
        0,
        this.getBackgroundColor(),
        this.drawColor,
        5,
        n => {
          const a = Math.sin(
            (this.wiggleCount / (this.fireDelay * 2)) * 2 * Math.PI +
              Math.PI / 2
          );
          return (
            (1 - 0.2 * i) *
            (1 + (0.3 + i * 0.2) * a * Math.sin((sides / 2) * n + Math.PI / 2))
          );
        }
      );
    }
  }
}
