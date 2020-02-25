import { Cone } from "../game/powerups/cone.js";
import { getImportantEntity, addToWorld } from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle, polygon, line } from "./draw.js";
import { Enemy, MATRYOSHKA_SIZE } from "./enemy.js";
import { randomNormalVec } from "../modules/helpers.js";
import { ChanceTable } from "../modules/chancetable.js";
import { randomInt } from "../modules/helpers.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

/** @type {ChanceTable<typeof import("../game/powerup.js").PowerUp>} */
const chanceTable = new ChanceTable();
// TODO: make these better
chanceTable.addAll([
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Wall, chance: 1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);

const SEGMENTS_PER_MATRYOSHKA = 3;

export class Snake extends Enemy {
  /** @type {Snake} */
  parentBody = undefined;

  /** @type {Snake} */
  childBody = undefined;

  /** @type {Vector} */
  facing = new Vector(1, 0);

  /**
   * constructs a scatter enemy
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   * @param {number} level
   * @param {ChanceTable} powerUpTable
   * @param {Snake} parentBody
   */
  constructor(
    pos,
    vel,
    acc,
    matryoshka,
    level,
    powerUpTable = chanceTable,
    parentBody = undefined
  ) {
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 10;
    this.initHealth();
    this.basePoints = 10;
    this.parentBody = parentBody;
    this.movementMultiplier = 0.5;

    // We don't want the snakes to get bigger, only to increase length, so we
    // factor out the MATRYOSHKA_SIZE constant.
    this.width -= MATRYOSHKA_SIZE * matryoshka;
    this.height -= MATRYOSHKA_SIZE * matryoshka;

    if (this.parentBody === undefined) {
      this.constructBody();
      this.acc = randomNormalVec()
        .mult(0.1)
        .mult(this.movementMultiplier);
    }

    // To prevent child enemies spawning on death
    this.matryoshka = 0;
  }

  // Generate the ligiments behind the head
  constructBody() {
    /** @type {Snake} */
    let bodyCursor = this;

    for (let i = 0; i < SEGMENTS_PER_MATRYOSHKA * (this.matryoshka + 1); i++) {
      // Create next ligiment
      let newBody = new Snake(
        bodyCursor.pos, //.add(SEGMENT_LEN, 0),
        undefined,
        undefined,
        this.matryoshka,
        this.level,
        undefined,
        bodyCursor
      );
      // Link the next body to be the new body
      bodyCursor.childBody = newBody;

      // Add the new body to the world
      addToWorld(newBody);

      bodyCursor = newBody;
    }
    // Apply powerups (because we ovverride the method in entity)
    this.applyPowerUpsToSnake(this.powerUpTable);
  }

  destroy() {
    // Remove link from the parent body back
    if (this.parentBody !== undefined) {
      this.parentBody.childBody = undefined;
    }
    // Remove link from the child body forward
    if (this.childBody !== undefined) {
      this.childBody.parentBody = undefined;
    }

    super.destroy();
  }

  action() {
    super.action();

    if (this.parentBody === undefined) {
      // Head
      if (Math.random() < 0.01) {
        const acc = randomNormalVec().mult(0.1);
        this.acc = acc.mult(this.movementMultiplier);
      }
      this.facing = this.vel.norm2();
    } else {
      //Body
      /** @type {Vector} */
      const desiredPos = this.parentBody.pos
        .sub(this.parentBody.facing.mult(this.parentBody.width / 2))
        .sub(this.parentBody.facing.mult(this.width / 2));
      this.vel = desiredPos.sub(this.pos);

      this.facing = this.vel.norm2();
    }
  }

  /**
   * Suppress this method so we can apply powerups to every ligiment at once.
   * @override
   * @param {import("../modules/chancetable.js").ChanceTable<typeof import("./powerup.js").PowerUp>} powerUpTable
   */
  applyPowerUps(powerUpTable) {}

  /**
   * @param {import("../modules/chancetable.js").ChanceTable<typeof import("./powerup.js").PowerUp>} powerUpTable
   */
  applyPowerUpsToSnake(powerUpTable) {
    if (powerUpTable === undefined) return;
    for (let i = 0; i < this.level; i++) {
      const powerup = new (powerUpTable.pick())(randomInt(5) + 1);

      /** @type {Snake} */
      let bodyCursor = this;
      while (bodyCursor !== undefined) {
        powerup.apply(bodyCursor);
        bodyCursor = bodyCursor.parentBody;
      }
    }
  }

  drawBody() {
    const bgColor = this.getBackgroundColor();
    if (this.childBody !== undefined) {
      line(this.pos, this.childBody.pos, this.drawColor, 2);
    } else {
      line(
        this.pos,
        this.pos.sub(this.facing.norm2().mult(this.width / 2)),
        this.drawColor,
        2
      );
    }
    if (this.parentBody === undefined) {
      const sides = 5;
      //   circle(this.drawPos, this.width / 2, bgColor, 2, this.drawColor);
      polygon(
        this.drawPos,
        sides,
        this.width,
        this.height,
        Math.atan2(this.vel.y, this.vel.x),
        bgColor,
        this.drawColor
      );
    } else {
      circle(this.drawPos, this.width / 2, bgColor, 2, this.drawColor);
    }
  }

  drawFace() {}

  /**
   * @param {Vector} pos
   * @override
   */
  collideWithBlock(pos) {
    if (this.parentBody === undefined) this.acc.mult(-1);
  }
}
