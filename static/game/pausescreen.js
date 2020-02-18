import {
  setPause,
  addToGui,
  toggleGuiElement,
  getImportantEntity
} from "../modules/gamemanager.js";
import { Menu } from "./menu.js";
import { Vector } from "../modules/vector.js";
import { centeredText, rect } from "./draw.js";
import { resetDemo } from "../main.js";
import { Codex } from "./codex.js";
import { Stats } from "./stats.js";
import { Hero } from "./hero.js";
import {
  getScreenDimensions,
  toggleFullscreen
} from "../modules/displaymanager.js";
import { SettingsMenu } from "./settingsmenu.js";
import { ControlsMenu } from "./controlsmenu.js";

export class PauseScreen extends Menu {
  /** @type {Menu[]} */
  childMenus;

  constructor() {
    const screenDimensions = getScreenDimensions();
    super(new Vector(0, 0), screenDimensions.width, screenDimensions.height);

    // create sub-menus
    const codex = new Codex();
    codex.active = false;
    addToGui("codex", codex);
    const stats = new Stats();
    stats.active = false;
    addToGui("stats", stats);
    const settingsmenu = new SettingsMenu();
    settingsmenu.active = false;
    addToGui("settingsmenu", settingsmenu);
    this.childMenus = [codex, stats, settingsmenu];
    const controlsmenu = new ControlsMenu();
    controlsmenu.active = false;
    addToGui("controlsmenu", controlsmenu);

    this.setItems([
      { text: "Resume", func: this.onBack.bind(this) },
      {
        text: "Codex",
        func: () => {
          this.active = false;
          toggleGuiElement("codex");
        }
      },
      {
        text: "Stats",
        func: () => {
          this.active = false;
          toggleGuiElement("stats");
        }
      },
      {
        text: "Settings",
        func: () => {
          this.active = false;
          toggleGuiElement("settingsmenu");
        }
      },
      {
        text: "Controls",
        func: () => {
          this.active = false;
          toggleGuiElement("controlsmenu");
        }
      },
      {
        text: "Enter fullscreen",
        func: toggleFullscreen
      },
      {
        text: "Give up",
        func: () => {
          const hero = /** @type {Hero} */ (getImportantEntity("hero"));
          hero.takeDamage(Infinity);
          this.onBack();
        }
      },
      { text: "Start over", func: resetDemo }
    ]);
    this.itemWidth = 600;
  }

  action() {
    if (document.fullscreenElement === null) {
      this.items[5].text = "Enter fullscreen";
    } else {
      this.items[5].text = "Exit fullscreen";
    }
    super.action();
  }

  draw() {
    const screenDimensions = getScreenDimensions();
    rect(
      new Vector(0, 0),
      screenDimensions.width,
      screenDimensions.height,
      "rgba(0,0,0,.9)"
    );
    super.draw();
    centeredText(
      "Paused!",
      this.pos.add(new Vector(screenDimensions.width / 2, 100)),
      "bold 100px anonymous",
      undefined,
      undefined,
      "white"
    );
  }

  /**
   * unpause when we press 'back'. This will also be called when we press the
   * pause button from this menu or any submenu
   * @override
   */
  onBack() {
    // close all sub-menus
    this.childMenus.forEach(menu => {
      menu.active = false;
    });
    setPause(false);
    super.onBack();
  }
}
