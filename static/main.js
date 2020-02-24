import {
  startUp,
  addToGui,
  destroyEverything,
  setPause
} from "./modules/gamemanager.js";
import { Vector } from "./modules/vector.js";
import { addSound, playSound, loopSound } from "./modules/sound.js";
import { Healthbar } from "./game/healthbar.js";
import { BombDisplay } from "./game/bombdisplay.js";
import { PauseScreen } from "./game/pausescreen.js";
import { ScoreDisplay } from "./game/scoredisplay.js";
import { DeathScreen } from "./game/deathscreen.js";
import { resources } from "./game/resources.js";
import { getCanvasWidth } from "./modules/displaymanager.js";
import { startLevelFromSettings, settingsGroups } from "./game/levelpresets.js";

export function resetDemo() {
  destroyEverything();
  setPause(false);

  // Add GUI elements
  const healthbar = new Healthbar(new Vector(16, 0));
  addToGui("healthbar", healthbar);
  const bombdisplay = new BombDisplay(new Vector(0, 100));
  addToGui("bombdisplay", bombdisplay);
  // TODO replace with some sort of border vec
  const scoredisplay = new ScoreDisplay(new Vector(getCanvasWidth() - 5, 5));
  addToGui("scoredisplay", scoredisplay);

  // this adds the time display so it has to go before adding menus
  startLevelFromSettings(settingsGroups.original);

  // add menus to the GUI last as they should draw over everything else
  const deathscreen = new DeathScreen();
  deathscreen.active = false;
  addToGui("deathscreen", deathscreen);
  const pausescreen = new PauseScreen();
  pausescreen.active = false;
  addToGui("pausescreen", pausescreen);
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
