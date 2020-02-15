import { Vector } from "../modules/vector.js";
import { Menu } from "./menu.js";
import { centeredText } from "./draw.js";
import { toggleGuiElement, addToGui } from "../modules/gamemanager.js";
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
    this.itemWidth = 500;
    this.submitted = false;
  }

  /**
   * @override
   */
  draw() {
    centeredText(
      "You have died",
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
    getContext().translate(0, 240);
    super.draw();
    getContext().translate(0, -240);
  }

  /**
   * @override
   */
  action() {
    if (this.submitted) {
      if (this.items[0]) {
        this.items[0] = { text: "Submitted!", func: undefined };
      }
    } else {
      this.hero = getImportantEntity("hero");
      this.score = /** @type {Hero} */ (this.hero).score;
      if (this.active) this.opacity += 0.01;
      this.selectedFillStyle = `rgba(0, 0, 255, ${this.opacity})`;
      this.downFillStyle = `rgba(68, 68, 204, ${this.opacity})`;
      // get score from input box
      const input = /** @type {HTMLInputElement} */ (document.getElementById(
        "name-input"
      ));
      const username = input.value;
      if (username === undefined || username === "") {
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
    super.action();
  }

  /**
   * does nothing, preventing the menu from being closed
   * @override
   */
  onBack() {}

  /**
   * focuses on the name input
   */
  enterName() {
    if (document.fullscreenElement !== null) {
      toggleFullscreen().then(() => {
        document.getElementById("name-input").focus();
      });
    } else {
      document.getElementById("name-input").focus();
    }
  }

  /**
   * Submits the user's score to the leaderboard
   */
  submitScore() {
    const input = /** @type {HTMLInputElement} */ (document.getElementById(
      "name-input"
    ));
    const username = input.value;
    fetch("/score", {
      method: "POST",
      body: JSON.stringify({ username: username, score: this.score }),
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
