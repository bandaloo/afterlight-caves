import { boardToString, getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import {
  startUp,
  setGameDrawFunc,
  addToWorld,
  setTerrain,
  setDimensions,
  destroyEverything,
  setCameraEntity,
  setImportantEntity,
  getTerrain,
  setGameGuiFunc,
  getImportantEntity,
  getContext
} from "./modules/gamemanager.js";
import {
  drawBoard,
  drawCircle,
  centeredOutlineCircle,
  centeredOutlineEllipse,
  centeredText,
  centeredOutlineRect
} from "./game/draw.js";
import { Enemy, randomLook, randomStats } from "./game/enemy.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { initBlockField, distanceBoard } from "./game/generator.js";
import { Boss } from "./game/boss.js";
import { PowerUp } from "./game/powerup.js";
import { Bigify } from "./game/powerups/bigify.js";
import { Zoom } from "./game/powerups/zoom.js";
import { Rubber } from "./game/powerups/rubber.js";
import { Elastic } from "./game/powerups/elastic.js";
import { Littlify } from "./game/powerups/littlify.js";
import { Xplode } from "./game/powerups/xplode.js";
import { Scatter } from "./game/scatter.js";
import { Chase } from "./game/chase.js";
import { Shooter } from "./game/shooter.js";
import { populateLevel } from "./game/spawner.js";
import { FireRate } from "./game/powerups/firerate.js";
import { Damage } from "./game/powerups/damage.js";
import { Creature } from "./game/creature.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

/** @type {string} */
let color;

/** @type {import("./game/enemy.js").Look[]} */
let enemyLooks = [];

/** @type {import("./game/enemy.js").Stats[]} */
let enemyStats = [];

function resetDemo() {
  destroyEverything();
  color = hsl(randomInt(360));
  enemyLooks = [];
  enemyStats = [];

  let board = getGrid(
    blockColumns * 8,
    blockRows * 8,
    caveRules,
    EdgesEnum.alive,
    0.45,
    20
  );

  setTerrain(board);
  initBlockField(board);
  setDimensions(blockWidth, blockHeight);

  setGameDrawFunc(() => {
    drawBoard(board, blockWidth, blockHeight, color);
  });

  setGameGuiFunc(() => {
    // TODO get rid of magic numbers for drawing the gui
    const borderVec = new Vector(8, 8);
    const hero = getImportantEntity("hero");
    const health = /** @type {Creature} */ (hero).currentHealth;
    const maxHealth = /** @type {Creature} */ (hero).maxHealth;
    // Uncenter the centered outline rect
    const maxHealthWidth = maxHealth * 10;
    const healthWidth = health * 10;
    const maxHealthVec = new Vector(maxHealthWidth / 2, 32).add(borderVec);
    const healthVec = new Vector(healthWidth / 2, 32).add(borderVec);
    centeredOutlineRect(maxHealthVec, maxHealthWidth, 64, 4, "white");
    centeredOutlineRect(healthVec, healthWidth, 64, 4, "white", "#ffffff77");
    centeredText(
      "" + health,
      new Vector(16, 32).add(borderVec),
      "white",
      "black",
      undefined,
      "left",
      "middle",
      3
    );
  });

  let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

  // create four looks with four difficulties
  for (let i = 0; i < 4; i++) {
    enemyLooks.push(randomLook());
    enemyStats.push(randomStats(i * 3 + 3));
  }

  populateLevel(getTerrain(), 500);
  // TODO change this with actual powerup spawning
  //const powerUpTypes = [Bigify, Elastic, Rubber, Zoom];
  const powerUpTypes = [FireRate, Damage];
  for (let i = 0; i < 70; ++i) {
    const r = Math.random();
    const magnitude = Math.floor(Math.random() * 5) + 1;
    const location = emptySpaces[
      Math.floor(Math.random() * emptySpaces.length)
    ].add(new Vector(blockWidth / 2, blockHeight / 2));
    for (let j = 1; j <= powerUpTypes.length; ++j) {
      if (r < j / powerUpTypes.length) {
        const powerUp = new powerUpTypes[j - 1](location, magnitude);
        addToWorld(powerUp);
        break;
      }
    }
  }

  const hero = new Hero(
    new Vector(0, 0).add(
      new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[11])
    )
  );

  const boss = new Boss(
    hero.pos.add(new Vector(80, 80)),
    enemyLooks[randomInt(4)],
    enemyStats[randomInt(4)],
    undefined,
    undefined,
    { size: randomInt(3), speed: 0, explode: 0 }
  );
  addToWorld(boss);

  setCameraEntity(hero);
  setImportantEntity("hero", hero);
  addToWorld(hero);
}

document.addEventListener("keydown", e => {
  const code = e.keyCode;
  const key = String.fromCharCode(code);
  // press F for fullscreen
  if (key == "R") {
    resetDemo();
  }
});

resetDemo();

startUp();
