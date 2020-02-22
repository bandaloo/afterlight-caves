import { getGrid, getEmptySpaces } from "./game/life.js";
import { caveRules, EdgesEnum } from "./game/rules.js";
import {
  startUp,
  addToWorld,
  addToGui,
  setTerrain,
  setDimensions,
  destroyEverything,
  setCameraEntity,
  setImportantEntity,
  getTerrain,
  setPause
} from "./modules/gamemanager.js";
import { drawBoard } from "./game/draw.js";
import { Vector } from "./modules/vector.js";
import { shuffle, randomInt, hsl } from "./modules/helpers.js";
import { Hero } from "./game/hero.js";
import { initBlockField } from "./game/generator.js";
import { spawnEnemies, spawnPowerups } from "./game/spawner.js";
import { addSound, playSound, loopSound } from "./modules/sound.js";
import { Healthbar } from "./game/healthbar.js";
import { BombDisplay } from "./game/bombdisplay.js";
import { PauseScreen } from "./game/pausescreen.js";
import { ScoreDisplay } from "./game/scoredisplay.js";
import { DeathScreen } from "./game/deathscreen.js";
import { resources } from "./game/resources.js";
import { setGameDrawFunc, getCanvasWidth } from "./modules/displaymanager.js";
import { TimeDisplay } from "./game/timedisplay.js";

// TODO these names are confusing
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

  let board = getGrid(
    blockColumns * 8,
    blockRows * 8,
    caveRules,
    EdgesEnum.alive,
    0.5,
    20
  );

  setGameDrawFunc(() => {
    drawBoard(board, blockWidth, blockHeight, color);
  });

  // Add GUI elements
  const healthbar = new Healthbar(new Vector(16, 0));
  addToGui("healthbar", healthbar);
  const bombdisplay = new BombDisplay(new Vector(0, 100));
  addToGui("bombdisplay", bombdisplay);
  // TODO replace with some sort of border vec
  const scoredisplay = new ScoreDisplay(new Vector(getCanvasWidth() - 5, 5));
  addToGui("scoredisplay", scoredisplay);
  const timedisplay = new TimeDisplay(new Vector(0, 200 - 32));
  addToGui("timedisplay", timedisplay);

  // add menus to the GUI last as they should draw over everything else
  const deathscreen = new DeathScreen();
  deathscreen.active = false;
  addToGui("deathscreen", deathscreen);
  const pausescreen = new PauseScreen();
  pausescreen.active = false;
  addToGui("pausescreen", pausescreen);

  let emptySpaces = shuffle(getEmptySpaces(board, 10, blockWidth, blockHeight));

  const hero = new Hero(
    new Vector(0, 0).add(
      new Vector(blockWidth / 2, blockHeight / 2).add(emptySpaces[11])
    )
  );

  setImportantEntity("hero", hero);
  setCameraEntity(hero);
  addToWorld(hero);

  setTerrain(board);
  initBlockField(board);
  // has to be called after setTerrain for the splatter canvas
  setDimensions(blockWidth, blockHeight);

  spawnEnemies(getTerrain(), 0.025, 1000, 4000);
  spawnPowerups(getTerrain());
}

let loaded = 0;

// load all resources
resources.forEach(resource => {
  addSound(
    resource.name,
    resource.file,
    resource.vol !== undefined ? resource.vol : 1.0
  ).then(() => {
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
    playSound("captive-portal", false, true);
    loopSound("captive-portal");
    resetDemo();
    startUp();
  }, 1);
};

startForm.onsubmit = start;

// spin doing nothing while we wait for everything load
const checkLoading = () => {
  if (1 - loaded > 0.001) {
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
