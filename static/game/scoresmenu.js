import { toggleGuiElement } from "../modules/gamemanager.js";
import { Menu } from "./menu.js";
import { rect } from "./draw.js";
import { Vector } from "../modules/vector.js";
import {
  getCanvasWidth,
  getCanvasHeight,
  getScreenDimensions
} from "../modules/displaymanager.js";
import { GAME_URL } from "../main.js";

export class ScoresMenu extends Menu {
  /**
   * undefined = not yet started
   * 0 = in progress
   * 200 = success
   * otherwise = error
   * @type {number | undefined}
   */
  scoresStatus;

  constructor() {
    super(new Vector(0, 0), getCanvasWidth(), getCanvasHeight());
    this.scoresStatus = undefined;
    this.itemWidth = 1500;
    /** @type {CanvasTextAlign} */
    this.textAlign = "left";
    this.textStyle = "50px anonymous";
  }

  /**
   * @override because canvas doesn't draw tabs. This is a dumb hack
   * @param {number} x
   * @param {number} y
   * @param {string} text
   */
  drawText(x, y, text) {
    const tabs = text.split("\t");
    super.drawText(x, y, tabs[0]);
    if (tabs[1] !== undefined) super.drawText(x + 420, y, tabs[1]);
  }

  action() {
    if (this.scoresStatus === undefined) {
      this.scoresStatus = 0;
      fetch(GAME_URL + "/scores", { method: "GET" })
        .then(response => response.json())
        .then((/** @type {{ status: number, message: string }} */ obj) => {
          this.scoresStatus = obj.status;
          if (this.scoresStatus !== 200) {
            throw new Error();
          }
          this.setItems(
            JSON.parse(obj.message)
              .scores.sort((a, b) => b.score - a.score)
              .map((val, i) => {
                const index = ("" + (i + 1) + ")").padEnd(5, " ");
                return {
                  text: `${index}${val.score}\t${val.username}`,
                  func: undefined
                };
              })
          );
          if (this.items.length === 0) {
            this.setItems([{ text: "No scores yet", func: undefined }]);
          }
        })
        .catch(reason => {
          this.scoresStatus = 500;
          console.error(reason);
        });
    }
    if (this.scoresStatus === 0) {
      this.setItems([{ text: "Fetching scores...", func: undefined }]);
    } else if (this.scoresStatus !== 200) {
      this.setItems([{ text: "Failed to get scores", func: undefined }]);
    }
    super.action();
  }

  /**
   * @override
   */
  draw() {
    const screenDimensions = getScreenDimensions();
    rect(
      new Vector(0, 0),
      screenDimensions.width,
      screenDimensions.height,
      "rgba(0,0,0,.9)"
    );
    super.draw();
  }

  /**
   * @override
   */
  onBack() {
    super.onBack();
    toggleGuiElement("deathScreen");
  }
}
