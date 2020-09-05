import {
  addToGui,
  destroyEverything,
  setPause,
  startUp
} from "./modules/gamemanager.js";
import { Vector } from "./modules/vector.js";
import { addSound, loopSound, playSound } from "./modules/sound.js";
import { HealthBar } from "./game/healthbar.js";
import { BombDisplay } from "./game/bombdisplay.js";
import { PauseScreen } from "./game/pausescreen.js";
import { ScoreDisplay } from "./game/scoredisplay.js";
import { DeathScreen } from "./game/deathscreen.js";
import { resources } from "./game/resources.js";
import { getCanvasHeight, getCanvasWidth } from "./modules/displaymanager.js";
import { settingsGroups, startLevelFromSettings } from "./game/levelpresets.js";
import { ItemDisplay } from "./game/itemdisplay.js";

/**
 * URL to post scores to, like "https://example.com"
 * The build-prod.sh script relies on the exact name 'GAME_URL', so if you
 * change it here make sure to also change it there.
 * @type {string}
 */
export const GAME_URL = "";

export function resetDemo() {
  destroyEverything();
  setPause(false);

  // Add GUI elements
  const healthBar = new HealthBar(new Vector(16, 0));
  addToGui("healthBar", healthBar);
  const bombDisplay = new BombDisplay(new Vector(0, 100));
  addToGui("bombDisplay", bombDisplay);
  // TODO replace with some sort of border vec
  const scoreDisplay = new ScoreDisplay(new Vector(getCanvasWidth() - 5, 5));
  addToGui("scoreDisplay", scoreDisplay);
  const itemDisplay = new ItemDisplay(new Vector(
    getCanvasWidth() - 5,
    getCanvasHeight() - 15
  ));
  addToGui("itemDisplay", itemDisplay);

  // this adds the time display so it has to go before adding menus
  startLevelFromSettings(settingsGroups.original);

  // add menus to the GUI last as they should draw over everything else
  const deathScreen = new DeathScreen();
  deathScreen.active = false;
  addToGui("deathScreen", deathScreen);
  const pauseScreen = new PauseScreen();
  pauseScreen.active = false;
  addToGui("pauseScreen", pauseScreen);
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
    playSound("afterlight-caves", false, true);
    loopSound("afterlight-caves");
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
