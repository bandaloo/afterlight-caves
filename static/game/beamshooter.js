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

const TURN_SPEED = 0.01;
const TURN_CHANCE = 0.005;
const ON_TARGET_ANGLE = 0.05;
const IDLE_TURN_SPEED = 0.002;

/**
 * This type of enemy moves around randomly, rotating slowly while waiting for
 * the hero to draw near. Once the hero gets close it rotates to face it, then
 * fires a beam
 */
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
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 40;
    this.initHealth();
    this.bulletType = Beam;
    this.bulletSpeed = 5;
    this.fireDelay = 250;
    this.bulletLifetime = 120;
    this.basePoints = 90;
    this.maxSpeed = 1;
    this.bulletColor = `hsl(${this.getPowerHue()}, 100%, 20%)`;
    this.drag = 0.007;
    this.reflectsOffWalls = false;

    this.turnRandomDirection();
    // the direction this is facing
    this.facing = this.acc.norm2();
    this.faceSize = 0.2;
  }

  /** turn to face a random direction */
  turnRandomDirection() {
    const angle = (Math.PI / 2) * randomInt(4);
    this.acc = new Vector(Math.cos(angle), Math.sin(angle));
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

    // TODO this AI could be much better
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (dirVec.mag() < this.shootDistance) {
        const radians = this.facing.angleBetween(dirVec.norm2());
        if (Math.abs(radians) > ON_TARGET_ANGLE) {
          // turn to face hero
          this.facing = this.facing
            .rotate(Math.sign(this.facing.cross(dirVec)) * TURN_SPEED)
            .norm2();
        }
        this.shoot(this.facing);
      } else {
        // can't see the hero, spin slowly
        this.facing = this.facing.rotate(IDLE_TURN_SPEED).norm2();
      }
    }
    if (Math.random() < TURN_CHANCE) this.turnRandomDirection();
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
