import {
  getGameTime,
  getImportantEntity,
  hasImportantEntity
} from "../modules/gamemanager.js";
import { Vector } from "../modules/vector.js";
import { circle, ellipse, line, polygon } from "./draw.js";
import { Enemy } from "./enemy.js";
import { ChanceTable } from "../modules/chancetable.js";
import { PowerUp } from "./powerup.js";
import * as PowerUpTypes from "../game/powerups/poweruptypes.js";

const chanceTable = new ChanceTable();
chanceTable.addAll([
  { result: PowerUpTypes.DamageUp, chance: 1 },
  { result: PowerUpTypes.Hot, chance: 1 },
  { result: PowerUpTypes.Vitality, chance: 1 },
  { result: PowerUpTypes.Zoom, chance: 1 }
]);

// TODO could we be making some of the imports just used for typing use
// import("./hero.js").Hero instead of an actual import? (like in enemy.js)

export class Chase extends Enemy {
  followDistace = 500;
  following = false;
  followTimer = 0;
  followTimerMax = 200;

  /**
   * constructs a random entity with all the relevant vectors
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   * @param {number} matryoshka
   * @param {number} level
   * @param {ChanceTable<typeof PowerUp>} powerUpTable
   */
  constructor(pos, vel, acc, matryoshka, level, powerUpTable) {
    super(pos, vel, acc, matryoshka, level, powerUpTable);
    this.baseHealth = 20;
    this.initHealth();
    this.basePoints = 40;
    this.drag = 0.015;
    this.collideMap.set("PlayerBullet", e => {
      this.followTimer = this.followTimerMax;
    });
  }

  action() {
    super.action();
    if (hasImportantEntity("hero")) {
      const hero = getImportantEntity("hero");
      /** @type {Vector} */
      let dirVec = hero.pos.sub(this.pos);
      if (this.followTimer >= 0 || dirVec.magnitude() < this.followDistace) {
        this.followTimer--;
        this.following = true;
        this.acc = dirVec
          .norm2()
          .mult(0.15)
          .mult(this.movementMultiplier);
      } else {
        this.following = false;
        this.acc = new Vector(0, 0);
      }
    }
  }

  drawBody() {
    const sides = 5;
    const bgColor = this.getBackgroundColor();
    for (let i = 0; i < 2; i++) {
      polygon(
        this.drawPos,
        sides,
        this.width * 1.2,
        this.height * 1.2,
        getGameTime() / 1000 + (i * sides) / 2 / 5,
        bgColor,
        this.drawColor,
        5,
        n => 1 + Math.sin(2 * n + getGameTime() / (200 + 100 * i)) / 5
      );
    }
  }

  drawFace() {
    const eyeSpacing = 5;
    const eyeSize = 7;
    /**
     * draw the eye
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawEye = scalar => {
      ellipse(
        this.drawPos.add(new Vector(scalar * eyeSpacing, 0)),
        eyeSize * 3,
        eyeSize * 1.5,
        undefined,
        4,
        this.drawColor
      );
    };

    /**
     * draw the pupil
     * @param {number} scalar change this to modify what side of face to draw
     */
    const drawPupil = scalar => {
      circle(
        this.drawPos.add(new Vector(scalar * eyeSpacing, 0)),
        eyeSize,
        undefined,
        4,
        this.drawColor
      );
    };

    if (this.following) {
      drawEye(0);
      drawPupil(0);
    } else {
      line(
        this.drawPos.sub(new Vector(eyeSize * 3, 0)),
        this.drawPos.add(new Vector(eyeSize * 3, 0)),
        this.drawColor,
        4
      );
    }

    const mouthWidth = 16;
    const mouthOffset = 10;

    // draw the mouth
    const mouthHalf = mouthWidth / 2;

    line(
      new Vector(this.drawPos.x + mouthHalf, this.drawPos.y + mouthOffset),
      new Vector(this.drawPos.x - mouthHalf, this.drawPos.y + mouthOffset),
      this.drawColor,
      4
    );
  }
}
