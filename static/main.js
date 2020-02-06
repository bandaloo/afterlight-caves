import { getGrid, getEmptySpaces } from "./game/life.js";
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
  getImportantEntity
} from "./modules/gamemanager.js";
import { drawBoard, centeredText, rect } from "./game/draw.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { initBlockField, segregateTerrain } from "./game/generator.js";
import { populateLevel } from "./game/spawner.js";
import { Creature } from "./game/creature.js";
import { powerUpTypes } from "./game/powerups/poweruptypes.js";
import {
  addSound,
  playSound,
  pauseSound,
  resetSound,
  loopSound
} from "./modules/sound.js";

// load resources
addSound("enemy-hurt", "../sounds/enemy-hurt.wav");
addSound("laser-shot", "../sounds/laser-shot.wav");
addSound("spacey-snd", "../sounds/spacey-snd.wav");
addSound("captive-portal", "../sounds/captive-portal.mp3");

playSound("captive-portal", false);
loopSound("captive-portal");

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

/** @type {string} */
let color;

function resetDemo() {
  destroyEverything();
  color = hsl(randomInt(360));

  let board = getGrid(
    blockColumns * 8,
    blockRows * 8,
    caveRules,
    EdgesEnum.alive,
    0.5,
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
    const sizeScalar = 6;
    const borderVec = new Vector(8, 8);
    const healthHeight = 64;
    const hero = getImportantEntity("hero");
    const health = /** @type {Creature} */ (hero).getCurrentHealth();
    const maxHealth = /** @type {Creature} */ (hero).maxHealth;
    const currentBombs = /** @type {Creature} */ (hero).currentBombs;
    const maxBombs = /** @type {Creature} */ (hero).maxBombs;
    const maxHealthWidth = maxHealth * sizeScalar;
    const healthWidth = Math.max(health * sizeScalar, 0);
    const healthColor = "rgba(255, 50, 122, 90%)";
    rect(borderVec, healthWidth, healthHeight, healthColor, healthColor, 4);
    rect(borderVec, maxHealthWidth, healthHeight, undefined, "white", 4);
    // round health to nearest tenth if it's not a whole number
    let healthString = "" + health;
    if (Math.floor(health) !== health) healthString = health.toFixed(1);
    centeredText(
      healthString,
      new Vector(16, 0).add(borderVec).add(new Vector(0, healthHeight / 2)),
      "bold 60px sans-serif",
      "left",
      "middle",
      "white"
    );
    centeredText(
      `${currentBombs} / ${maxBombs}`,
      new Vector(0, 100).add(borderVec),
      "bold 60px sans-serif",
      "left",
      "middle",
      "white"
    );
  });

  let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

  // Get the segregated board
  const {
    segregatedBoard: segregatedBoard,
    groupNum: groupNum,
    largestGroup: largestGroup
  } = segregateTerrain(board);

  // Init the cave locations array
  const caveLocations = [];
  for (let i = 0; i < groupNum; i++) {
    caveLocations.push([]);
  }

  // For each cave, give it a list of available terrain.
  for (let i = 0; i < segregatedBoard.length; i++) {
    for (let j = 0; j < segregatedBoard[i].length; j++) {
      const location = segregatedBoard[i][j];
      if (location != 0)
        caveLocations[location - 1].push(
          new Vector(i * blockWidth, j * blockHeight)
        );
    }
  }

  // If empty numbers exist (They shouldn't, but do) delete them.
  // TODO: figure out why we need this
  for (let i = 0; i < caveLocations.length; i++) {
    if (caveLocations[i].length == 0) caveLocations.splice(i, i);
  }

  const hero = new Hero(
    new Vector(0, 0).add(
      new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[11])
    )
  );

  setImportantEntity("hero", hero);
  setCameraEntity(hero);
  addToWorld(hero);

  populateLevel(getTerrain(), 320);

  const tilesPerAdditionalPowerupChance = 300;

  for (let i = 0; i < caveLocations.length; i++) {
    if (i == largestGroup) continue;

    // Have a chance for an additional powerup for every 10 blocks.
    const additional_powerups = Math.floor(
      Math.max(1000 - caveLocations[i].length, 0) /
        tilesPerAdditionalPowerupChance
    );
    const powerup_num = Math.floor(Math.random() * additional_powerups) + 1;
    caveLocations[i].length;

    for (let p = 0; p < powerup_num; p++) {
      /** @type {Vector} */
      const randomTile =
        caveLocations[i][Math.floor(Math.random() * caveLocations[i].length)];

      const location = randomTile.add(
        new Vector(blockWidth / 2, blockHeight / 2)
      );

      const r = Math.random();
      const magnitude = Math.floor(Math.random() * 5) + 1;
      for (let j = 1; j <= powerUpTypes.length; ++j) {
        if (r < j / powerUpTypes.length) {
          const powerUp = new powerUpTypes[j - 1](location, magnitude);
          addToWorld(powerUp);
          break;
        }
      }
    }
  }
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
