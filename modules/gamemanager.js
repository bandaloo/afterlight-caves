import { Entity } from "./entity.js";

class GameManager {
  previousTime = 0;

  /** @type {Entity[]} */
  entities = [];

  // TODO consider whether we want the options pattern here
  constructor(
    width = 1920,
    height = 1080,
    displayWidth = 960,
    displayHeight = 540
  ) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.width = width;
    this.canvas.height = height;

    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.displayCanvas.width = displayWidth;
    this.displayCanvas.height = displayHeight;

    // drawing func defaults to a no-op
    this.drawFunc = () => {};

    const exitHandler = () => {
      this.displayCanvas.width = this.displayWidth;
      this.displayCanvas.height = this.displayHeight;
    };

    this.displayCanvas.addEventListener("fullscreenchange", exitHandler, false);

    document.addEventListener("keydown", e => {
      const code = e.keyCode;
      const key = String.fromCharCode(code);
      // press F for fullscreen
      if (key == "F") {
        this.displayCanvas.width = 1920;
        this.displayCanvas.height = 1080;
        this.enterFullscreen();
      }
    });

    this.addDisplayToDiv("gamediv");
  }

  enterFullscreen() {
    if (this.displayCanvas.requestFullscreen) {
      this.displayCanvas.requestFullscreen();
    }
  }

  addDisplayToDiv(id) {
    const displayDiv = document.getElementById(id);
    displayDiv.appendChild(this.displayCanvas);
  }

  // TODO should currentTime be optional?

  /**
   * @param {number} [currentTime]
   */
  update(currentTime) {
    // keep track of time passed
    let deltaTime = currentTime - this.previousTime;

    // clear the display canvas
    this.displayCanvas.width = this.displayCanvas.width;
    // clear the drawing canvas
    this.canvas.width = this.canvas.width;

    // TODO poll for input
    // TODO run step function of all entities
    // TODO check for collisions
    // TODO resolve collisions

    // save drawing context
    this.context.save();

    this.drawFunc();

    // draw all entities
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].draw();
    }

    // TODO get rid of all of this
    this.context.beginPath();
    this.context.arc(
      this.canvas.width / 2 + 50 * Math.cos(currentTime / 300),
      this.canvas.height / 2 + 50 * Math.sin(currentTime / 100),
      64,
      0,
      2 * Math.PI
    );
    this.context.fillStyle = "white";
    this.context.fill();

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
 * Set the additional draw function to happen every game loop
 * @param {() => void} drawFunc drawing function to happen every loop
 */
export function setGameDrawFunc(drawFunc) {
  gameManager.drawFunc = drawFunc;
}

/**
 * add an entity to the game world
 * @param {Entity} entity
 */
export function addToWorld(entity) {
  gameManager.entities.push(entity);
}
