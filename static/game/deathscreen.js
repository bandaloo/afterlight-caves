import { Vector } from "../modules/vector.js";
import { Menu } from "./menu.js";
import { centeredText } from "./draw.js";
import {
  toggleGuiElement,
  addToGui,
  collectInput
} from "../modules/gamemanager.js";
import { getImportantEntity } from "../modules/gamemanager.js";
import { toScoreString } from "./scoredisplay.js";
import { resetDemo } from "../main.js";
import { ScoresMenu } from "./scoresmenu.js";
import {
  getContext,
  getScreenDimensions,
  toggleFullscreen
} from "../modules/displaymanager.js";
import { Hero } from "./hero.js";
import {suppressGamepad} from "../modules/buttons.js";

/**
 * The screen that appears when a player dies, including a nice fade-in and
 * score display.
 */
export class DeathScreen extends Menu {
  /** @type {number} */
  score;
  /** @type {number} */
  opacity;
  /** @type {boolean} */
  submitted;
  /** @type {boolean} */
  enteringUsername;
  /** @type {string} */
  causeOfDeath;
  /** @type {string} */
  username;
  /** @type {number} */
  cursorBlinkCounter;

  constructor() {
    const screenDimensions = getScreenDimensions();
    super(
      new Vector(screenDimensions.width * 0.2, 0),
      screenDimensions.width * 0.6,
      screenDimensions.height
    );
    const scoresmenu = new ScoresMenu();
    scoresmenu.active = false;
    addToGui("scoresmenu", scoresmenu);
    this.enteringUsername = false;
    this.username = "";
    this.cursorBlinkCounter = 0;

    this.setItems([
      { text: "Submit score", func: this.submitScore.bind(this) },
      {
        text: "View scores",
        func: () => {
          this.active = false;
          scoresmenu.scoresStatus = undefined;
          toggleGuiElement("scoresmenu");
        }
      },
      { text: "Restart", func: resetDemo }
    ]);
    this.score = 0;
    this.opacity = 0;
    this.itemWidth = 700;
    this.submitted = false;
    this.causeOfDeath = "You have died";
  }

  /**
   * @override
   */
  draw() {
    const cursor =
      this.enteringUsername && this.cursorBlinkCounter % 100 < 50 ? "_" : " ";
    centeredText(
      this.username + cursor,
      this.pos.add(new Vector(this.width / 2, this.height / 2 - 300)),
      "bold 75px anonymous",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")",
      undefined,
      8
    );
    centeredText(
      this.causeOfDeath,
      this.pos.add(new Vector(this.width / 2, this.height / 2)),
      "bold 250px anonymous",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")",
      undefined,
      8
    );
    centeredText(
      "your score was:",
      this.pos.add(new Vector(this.width / 2, this.height / 2 + 100)),
      "bold 60px anonymous",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    centeredText(
      toScoreString(this.score),
      this.pos.add(new Vector(this.width / 2, this.height / 2 + 160)),
      "bold 60px anonymous",
      undefined,
      undefined,
      "rgba(255, 255, 255, " + this.opacity + ")"
    );
    // TODO this is kind of a hack to push the normal menu elements down
    getContext().translate(0, 320);
    super.draw();
    getContext().translate(0, -320);
  }

  /**
   * @override
   */
  action() {
    if (this.submitted) {
      if (this.items[0]) {
        this.items[0] = { text: "Submitted!", func: undefined };
      }
    } else if (this.enteringUsername) {
      if (this.items[0]) {
        this.items[0] = { text: "Press enter to finish", func: undefined };
      }
    } else {
      this.hero = getImportantEntity("hero");
      this.score = /** @type {Hero} */ (this.hero).score;
      if (this.active) this.opacity += 0.01;
      if (this.username === undefined || this.username === "") {
        if (this.items[0]) {
          this.items[0] = {
            text: "Enter name",
            func: this.enterName.bind(this)
          };
        }
      } else {
        if (this.items[0]) {
          this.items[0] = {
            text: "Submit score",
            func: this.submitScore.bind(this)
          };
        }
      }
    }
    this.cursorBlinkCounter++;
    super.action();
  }

  /**
   * does nothing, preventing the menu from being closed
   * @override
   */
  onBack() {}

  /**
   * suppress all other controls to let the user enter a name
   */
  enterName() {
    collectInput(false);
    suppressGamepad(true);
    this.enteringUsername = true;
    /** @param {KeyboardEvent} ev */
    const listener = ev => {
      if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) ev.preventDefault();
      if (ev.key === "Enter") {
        // break out
        this.enteringUsername = false;
        collectInput(true);
        suppressGamepad(false);
        document.removeEventListener("keydown", listener);
      } else if (ev.key === "Backspace") {
        this.username = this.username.substring(0, this.username.length - 1);
      } else if (/^\w{1}$/.test(ev.key) && this.username.length < 32) {
        this.username += ev.key;
      }
    };
    document.addEventListener("keydown", listener);
  }

  /**
   * Submits the user's score to the leaderboard
   */
  submitScore() {
    fetch("/score", {
      method: "POST",
      body: JSON.stringify({ username: this.username, score: this.score }),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    })
      .then(response => response.json())
      .then(obj => {
        if (
          obj === undefined ||
          obj.status === undefined ||
          obj.message === undefined
        ) {
          throw new Error();
        }
        if (obj.status === 200) {
          console.log(obj);
          // only let them submit once
          this.submitted = true;
        } else {
          throw new Error(obj);
        }
      })
      .catch(error => {
        console.error(error);
        if (this.items[0]) {
          this.items[0].text = "Error. Try again?";
        }
      });
  }
}
