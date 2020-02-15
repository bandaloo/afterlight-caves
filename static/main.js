import { getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import {
  startUp,
  setGameDrawFunc,
  addToWorld,
  addToGui,
  setTerrain,
  setDimensions,
  destroyEverything,
  setCameraEntity,
  setImportantEntity,
  getTerrain,
  setPause,
  getCanvasWidth
} from "./modules/gamemanager.js";
import { drawBoard } from "./game/draw.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { initBlockField, segregateTerrain } from "./game/generator.js";
import { populateLevel } from "./game/spawner.js";
import { powerUpTypes } from "./game/powerups/poweruptypes.js";
import { addSound, playSound, loopSound } from "./modules/sound.js";
import { Healthbar } from "./game/healthbar.js";
import { BombDisplay } from "./game/bombdisplay.js";
import { PauseScreen } from "./game/pausescreen.js";
import { ScoreDisplay } from "./game/scoredisplay.js";
import { DeathScreen } from "./game/deathscreen.js";

const blockWidth = 60;
const blockHeight = 60;
const worldWidth = 1920;
const worldHeight = 1080;
const blockColumns = worldWidth / blockWidth;
const blockRows = worldHeight / blockHeight;

/** @type {string} */
let color;

export function resetDemo() {
  destroyEverything();
  color = hsl(randomInt(360));
  setPause(false);
  const input = /** @type {HTMLInputElement} */ (document.getElementById(
    "name-input"
  ));
  input.value = "";

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
  // has to be called after setTerrain for the splatter canvas
  setDimensions(blockWidth, blockHeight);

  setGameDrawFunc(() => {
    drawBoard(board, blockWidth, blockHeight, color);
  });

  // Add GUI elements
  const healthbar = new Healthbar(new Vector(16, 0));
  addToGui("healthbar", healthbar);
  const bombdisplay = new BombDisplay(new Vector(0, 100));
  addToGui("bombdisplay", bombdisplay);
  const scoredisplay = new ScoreDisplay(new Vector(getCanvasWidth() - 5, 5));
  addToGui("scoredisplay", scoredisplay);

  // add menus to the GUI last as they should draw over everything else
  const deathscreen = new DeathScreen();
  deathscreen.active = false;
  addToGui("deathscreen", deathscreen);
  const pausescreen = new PauseScreen();
  pausescreen.active = false;
  addToGui("pausescreen", pausescreen);

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

    for (let p = 0; p < powerup_num; p++) {
      /** @type {Vector} */
      const randomIndex = Math.floor(Math.random() * caveLocations[i].length);
      const randomTile = caveLocations[i][randomIndex];
      caveLocations[i].splice(randomIndex, 1);

      const location = randomTile.add(
        new Vector(blockWidth / 2, blockHeight / 2)
      );

      const r = Math.random();
      const magnitude = Math.floor(Math.random() * 5) + 1;
      for (let j = 1; j <= powerUpTypes.length; ++j) {
        if (r < j / powerUpTypes.length) {
          const powerUp = new powerUpTypes[j - 1](magnitude, location);
          addToWorld(powerUp);
          break;
        }
      }
    }
  }
}

const resources = [
  { name: "enemy-hurt", file: "../sounds/enemy-hurt.wav" },
  { name: "laser-shot", file: "../sounds/laser-shot.wav" },
  { name: "spacey-snd", file: "../sounds/spacey-snd.wav" },
  { name: "captive-portal", file: "../sounds/captive-portal.mp3" }
];

let loaded = 0;

// load all resources
resources.forEach(resource => {
  addSound(resource.name, resource.file).then(() => {
    loaded += 1 / resources.length;
  });
});

// add loading bar to DOM
const bar = document.createElement("div");
bar.id = "loading-bar";
const barFill = document.createElement("div");
barFill.id = "loading-bar-fill";
document.getElementById("gamediv").appendChild(bar);
bar.appendChild(barFill);

// create start button
const startForm = document.createElement("form");
const startButton = document.createElement("button");
startButton.id = "start";
startButton.type = "submit";
startButton.innerText = "Start";
startForm.appendChild(startButton);

/**
 * @param {Event} ev
 */
const start = ev => {
  ev.preventDefault();
  startForm.remove();
  // set timeout so that button disappears immediately
  setTimeout(() => {
    playSound("captive-portal", false);
    loopSound("captive-portal");
    resetDemo();
    startUp();
  }, 1);
};

startForm.onsubmit = start;

// spin doing nothing while we wait for everything load
const checkLoading = () => {
  if (loaded < 1) {
    barFill.style.width = loaded * 100 + "%";
    requestAnimationFrame(checkLoading);
  } else {
    // done loading
    bar.remove();
    document.getElementById("gamediv").appendChild(startForm);
    startButton.focus();
  }
};

checkLoading();
