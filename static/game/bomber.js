import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { circle } from "./draw.js";
import { Orb } from "./powerups/orb.js";
import { randomNormalVec, randomInt } from "../modules/helpers.js";
import { ChanceTable } from "../modules/chancetable.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
const chanceTable = new ChanceTable();
chanceTable.addAll([
  { result: PowerUpTypes.Amplify, chance: 1 },
  { result: PowerUpTypes.BiggerBombs, chance: 1 },
  { result: PowerUpTypes.Cone, chance: 0.5 },
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.Elastic, chance: 1 },
  { result: PowerUpTypes.FlameThrower, chance: 1 },
  { result: PowerUpTypes.GroupBomb, chance: 0.5 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Icy, chance: 1 },
  { result: PowerUpTypes.Jalapeno, chance: 10 },
  { result: PowerUpTypes.Left, chance: 1 },
  { result: PowerUpTypes.Nitroglycerin, chance: 1 },
  { result: PowerUpTypes.Orb, chance: 1 },
  { result: PowerUpTypes.Popsicle, chance: 10 },
  { result: PowerUpTypes.QuickShot, chance: 1 },
  { result: PowerUpTypes.Right, chance: 1 },
  { result: PowerUpTypes.SlipperyBombs, chance: 5 },
  { result: PowerUpTypes.Thermalite, chance: 5 },
  { result: PowerUpTypes.UltraBomb, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Wall, chance: 1 },
  { result: PowerUpTypes.Xplode, chance: 0.5 },
  { result: PowerUpTypes.Yeet, chance: 1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);

export class Bomber extends Enemy {
  /**
   * constructs a bomber enemy
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   * @param {number} level
   */
  constructor(pos, vel, acc, matryoshka, level, powerUpTable = chanceTable) {
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 15;
    this.initHealth();
    new Orb(3 + randomInt(3)).apply(this);
    this.maxChargeCounter = 150;
    this.chargeCounter = 0;
    this.drag = 0.015;
    this.maxBombs = Infinity;
    this.setBombDamage(10);
    this.addBombs(Infinity);
    this.bulletSpeed = 5;
    this.bombBlastRadius = 200;
  }

  action() {
    this.chargeCounter++;
    this.chargeCounter %= this.maxChargeCounter;
    if (this.chargeCounter === 0) {
      this.vel = randomNormalVec().mult(5);
      this.placeBomb(this.pos);
    }
    super.action();
  }

  drawBody() {
    const chargeScalar = this.width * 0.2;
    /** @param {number} x */
    const shape = x => (2 * (x - 0.5)) ** 4;
    for (let i = 0; i < 2; i++)
      circle(
        this.drawPos,
        this.width / 2 +
          i * chargeScalar * shape(this.chargeCounter / this.maxChargeCounter),
        this.getBackgroundColor(),
        5,
        this.drawColor
      );
  }
}
