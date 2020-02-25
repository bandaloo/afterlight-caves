import { Enemy } from "./enemy.js";
import { Vector } from "../modules/vector.js";
import { line, circle } from "./draw.js";
import {
  hasImportantEntity,
  getImportantEntity
} from "../modules/gamemanager.js";
import { randomInt } from "../modules/helpers.js";
import { Beam } from "./bullet.js";
import { ChanceTable } from "../modules/chancetable.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
const chanceTable = new ChanceTable();
chanceTable.addAll([
  { result: PowerUpTypes.Amplify, chance: 1 },
  { result: PowerUpTypes.Cone, chance: 0.2 },
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.FlameThrower, chance: 1 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Icy, chance: 1 },
  { result: PowerUpTypes.Left, chance: 1 },
  { result: PowerUpTypes.MachineGun, chance: 1 },
  { result: PowerUpTypes.Right, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Wall, chance: 1 },
  { result: PowerUpTypes.Xplode, chance: 0.1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);


export class BeamShooter extends Enemy {
  shootDistance = 800;

  /**
   * @param {Vector} pos
   * @param {undefined} vel ignored
   * @param {undefined} acc ignored
   * @param {number} matryoshka
   * @param {number} level
   * @param {ChanceTable} powerUpTable
   */
  constructor(pos, vel, acc, matryoshka, level, powerUpTable = chanceTable) {
    super(pos, new Vector(0, 0), new Vector(0, 0), matryoshka, level, powerUpTable);
    this.baseHealth = 40;
    this.initHealth();
    this.bulletType = Beam;
    this.bulletSpeed = 5;
    this.fireDelay = 250;
    this.bulletLifetime = 120;
    this.basePoints = 90;
    this.maxSpeed = 1;
    this.bulletColor = "red";
    this.drag = 0.007;
    this.reflectsOffWalls = false;

    this.turnRandomDirection();
    // the direction this is facing
    this.facing = this.acc.norm2();
    this.faceSize = 0.2;
  }

  /**
   * turn to face a random direction
   */
  turnRandomDirection() {
    const d = randomInt(4);
    switch (d) {
      case 0:
        this.acc = new Vector(0, -1);
        break;
      case 1:
        this.acc = new Vector(1, 0);
        break;
      case 2:
        this.acc = new Vector(0, 1);
        break;
      case 3:
        this.acc = new Vector(-1, 0);
        break;
    }
  }

  /**
   * @param {Vector} pos
   * @override
   */
  collideWithBlock(pos) {
    this.acc = this.acc.mult(-1);
  }

  action() {
    super.action();
    this.faceSize = Math.min(this.fireCount / this.fireDelay + 0.2, 1);
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (dirVec.mag() < this.shootDistance) {
        const radians = this.facing.angleBetween(dirVec.norm2());
        if (Math.abs(radians) > 0.05) {
          // turn to face hero
          this.facing = this.facing
            .rotate((this.facing.cross(dirVec) < 0 ? -1 : 1) * 0.01)
            .norm2();
        }
        this.shoot(this.facing);
      } else {
        // can't see the hero, spin slowly
        this.facing = this.facing.rotate(0.002).norm2();
      }
    }
    if (Math.random() < 0.005) this.turnRandomDirection();
  }

  drawBody() {
    line(
      this.drawPos,
      this.drawPos.add(
        this.facing
          .norm2()
          .mult((this.width / 2) * this.faceSize)
          .rotate(0.2)
      ),
      this.drawColor,
      5
    );
    line(
      this.drawPos,
      this.drawPos.add(
        this.facing
          .norm2()
          .mult((this.width / 2) * this.faceSize)
          .rotate(-0.2)
      ),
      this.drawColor,
      5
    );
    const bgColor = this.getBackgroundColor();
    circle(this.drawPos, this.width / 2, bgColor, 5, this.drawColor);
    circle(
      this.drawPos,
      (this.width / 2) * this.faceSize,
      bgColor,
      5,
      this.drawColor
    );
  }
}
