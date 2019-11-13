import { Entity } from "./entity.js";
import { Vector } from "./vector.js";

class GameManager {
  updateTime = 10;
  overTime = 0;

  totalTime = 0;

  previousTime = 0;

  /** @type {Entity[]} */
  entities = [];

  /** @type {Vector[]} */
  lastPositions = [];

  /** @type {number[][]} */
  terrain = [];

  /** @type {number} */
  blockWidth;

  /** @type {number} */
  blockHeight;

  // TODO consider whether we want the options pattern here
  constructor(
    width = 1920,
    height = 1080,
    displayWidth = 960,
    displayHeight = 540
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.canvas.width = width;
    this.canvas.height = height;

    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    this.displayContext.imageSmoothingEnabled = false;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.displayCanvas.width = displayWidth;
    this.displayCanvas.height = displayHeight;

    // drawing func defaults to a no-op
    this.drawFunc = () => {};

    const exitHandler = () => {
      if (document.fullscreenElement === null) {
        this.displayCanvas.width = this.displayWidth;
        this.displayCanvas.height = this.displayHeight;
      }
    };

    this.displayCanvas.addEventListener("fullscreenchange", exitHandler, false);

    document.addEventListener("keydown", e => {
      const code = e.keyCode;
      const key = String.fromCharCode(code);
      // press F for fullscreen
      if (key == "F") {
        // TODO get rid of these magic numbers for resolution
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.enterFullscreen();
        console.log(
          `image smoothing drawing ${this.context.imageSmoothingEnabled} display ${this.displayContext.imageSmoothingEnabled}`
        );
      }
    });

    this.addDisplayToDiv("gamediv");
  }

  enterFullscreen() {
    if (this.displayCanvas.requestFullscreen) {
      this.displayCanvas.requestFullscreen();
    } else {
      throw new Error("no request fullscreen function");
    }
  }

  addDisplayToDiv(id) {
    const displayDiv = document.getElementById(id);
    displayDiv.appendChild(this.displayCanvas);
  }

  stepGame() {
    // TODO poll for input
    // run step function of all entities
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].step();
    }
    // push all entities out of walls
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].adjust();
    }
    // let all entities take their actions
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].action();
    }
    // TODO check for collisions
    // TODO resolve collisions
  }

  drawGame() {
    // clear the display canvas
    this.displayCanvas.width = this.displayCanvas.width;
    // clear the drawing canvas
    this.canvas.width = this.canvas.width;

    // save drawing context
    this.context.save();
    // run draw func specified by game programmer
    this.drawFunc();
    // draw all entities
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].draw();
    }
    // restore drawing context
    this.context.restore();

    // save display context
    this.displayContext.save();
    this.displayContext.scale(
      this.displayCanvas.width / this.canvas.width,
      this.displayCanvas.height / this.canvas.height
    );
    // copy the drawing canvas onto the display canvas
    this.displayContext.drawImage(this.canvas, 0, 0);
    // restore display context
    this.displayContext.restore();
  }

  // TODO should currentTime be an optional parameter?

  /**
   * @param {number} [currentTime]
   */
  update(currentTime = this.updateTime) {
    // keep track of time passed
    let deltaTime = currentTime - this.previousTime;
    this.totalTime += deltaTime;
    let gameSteps = 0;
    let timeLeft = deltaTime - this.overTime;
    while (timeLeft > 0) {
      // if this loop is the last step before going over time
      if (timeLeft <= this.updateTime) {
        this.lastPositions = [];
        // get the tween vectors
        for (let i = 0; i < this.entities.length; i++) {
          this.lastPositions.push(this.entities[i].pos);
        }
      }
      this.stepGame();
      timeLeft -= this.updateTime;
      gameSteps++;
    }
    console.log(gameSteps);
    // set all the tweened vectors to the draw positions
    for (let i = 0; i < this.entities.length; i++) {
      let tempPrevPos = this.lastPositions[i];
      let tempDrawPos = this.lastPositions[i].partway(
        this.entities[i].pos,
        (this.updateTime + timeLeft) / this.updateTime
      );
      let tempCurrPos = this.entities[i].pos;
      //console.log("prev " + tempPrevPos);
      //console.log("draw " + tempDrawPos);
      //console.log("curr " + tempCurrPos);
      this.entities[i].drawPos = tempDrawPos;
    }

    this.overTime = -timeLeft;

    this.drawGame();

    // increase the time
    this.previousTime = currentTime;
    requestAnimationFrame(this.update.bind(this));
  }
}

const gameManager = new GameManager();

export function startUp() {
  gameManager.update();
}

export function getCanvas() {
  return gameManager.canvas;
}

export function getContext() {
  return gameManager.context;
}

export function getCanvasWidth() {
  return gameManager.canvas.width;
}

export function getCanvasHeight() {
  return gameManager.canvas.height;
}

/**
 * set the additional draw function to happen every game loop
 * @param {() => void} drawFunc drawing function to happen every loop
 */
export function setGameDrawFunc(drawFunc) {
  gameManager.drawFunc = drawFunc;
}

/**
 * set the grid of numbers to determine solid parts of world
 * @param {number[][]} board
 */
export function setTerrain(board) {
  gameManager.terrain = board;
}

export function getTerrain() {
  return gameManager.terrain;
}

export function getTotalTime() {
  return gameManager.totalTime;
}

/**
 * set dimensions that the terrain is supposed to represent
 * @param {number} blockWidth
 * @param {number} blockHeight
 */
export function setDimensions(blockWidth, blockHeight) {
  gameManager.blockWidth = blockWidth;
  gameManager.blockHeight = blockHeight;
}

export function getDimensions() {
  return { width: gameManager.blockWidth, height: gameManager.blockHeight };
}

/**
 * add an entity to the game world
 * @param {Entity} entity
 */
export function addToWorld(entity) {
  gameManager.entities.push(entity);
}

export function destroyEverything() {
  gameManager.entities = [];
}
