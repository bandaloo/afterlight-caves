import { Vector } from "./vector.js";
import { getCameraEntity } from "./gamemanager.js";
import { Entity } from "./entity.js";
import { GuiElement } from "./guielement.js";
import { settings } from "../game/settings.js";

const BLUR_SCALAR = 2;
export const FILTER_STRING = "blur(3px) brightness(200%)";
export const SPLATTER_SCALAR = 4;

class DisplayManager {
  /** @type {Vector} */
  cameraOffset = new Vector(0, 0);

  constructor(
    width = 1920,
    height = 1080,
    displayWidth = 960,
    displayHeight = 540
  ) {
    // the canvas for drawing
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.tabIndex = 1;
    this.canvas.width = width;
    this.canvas.height = height;

    // the canvas for displaying
    this.displayCanvas = document.createElement("canvas");
    this.displayContext = this.displayCanvas.getContext("2d");
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.displayCanvas.width = displayWidth;
    this.displayCanvas.height = displayHeight;
    this.displayCanvas.id = "canvas";
    this.displayCanvas.tabIndex = 0;

    // the untouched canvas for blurring before copying
    this.blurCanvas = document.createElement("canvas");
    this.blurContext = this.blurCanvas.getContext("2d");
    this.blurCanvas.width = width / BLUR_SCALAR;
    this.blurCanvas.height = height / BLUR_SCALAR;

    // the canvas (that is rarely cleared) used for keeping permanent splatter
    this.splatterCanvas = document.createElement("canvas");
    this.splatterContext = this.splatterCanvas.getContext("2d");

    this.screenWidth = width;
    this.screenHeight = height;

    this.resetCounter = 0;

    this.blurContext.filter = "blur(3px) brightness(200%)";

    // drawing func defaults to a no-op
    this.drawFunc = () => {};

    const exitHandler = () => {
      if (document.fullscreenElement === null) {
        this.displayCanvas.width = this.displayWidth;
        this.displayCanvas.height = this.displayHeight;
      }
    };

    this.displayCanvas.addEventListener("fullscreenchange", exitHandler, false);
  }

  /**
   * @returns {Promise<void>}
   */
  enterFullscreen() {
    if (this.displayCanvas.requestFullscreen) {
      return this.displayCanvas.requestFullscreen();
    } else {
      throw new Error("no request fullscreen function");
    }
  }

  /**
   * draw all the entities and particles
   * @param {Entity[]} entities
   * @param {Entity[]} particles
   * @param {Map<string, GuiElement>} guiElements
   */
  drawGame(entities, particles, guiElements) {
    // reposition camera if there is a followed entity
    if (getCameraEntity() !== undefined) {
      this.cameraOffset = getCameraEntity()
        .drawPos.mult(-1)
        .add(new Vector(this.screenWidth / 2, this.screenHeight / 2));
    }

    // clear the display canvas with black rectangle
    this.displayContext.fillRect(
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );

    // clear the drawing canvas with alpha 0
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // clear the blur canvas with alpha 0
    this.blurContext.clearRect(
      0,
      0,
      this.blurCanvas.width,
      this.blurCanvas.height
    );

    if (settings["Splatter effects"].value) {
      // copy the splatter canvas onto the drawing canvas
      const targetCanvas = this.displayCanvas;
      const targetContext = this.displayContext;
      const splatterVec = getCameraOffset().mult(-1 / SPLATTER_SCALAR);
      const displayRatio = this.canvas.width / targetCanvas.width;
      targetContext.drawImage(
        this.splatterCanvas,
        splatterVec.x,
        splatterVec.y,
        (targetCanvas.width / SPLATTER_SCALAR) * displayRatio,
        (targetCanvas.height / SPLATTER_SCALAR) * displayRatio,
        0,
        0,
        targetCanvas.width,
        targetCanvas.height
      );
    }

    // save drawing context
    this.context.save();
    // run draw func specified by game programmer
    this.drawFunc();

    // draw all particles
    for (let i = 0; i < particles.length; i++) {
      if (particles[i].onScreen()) {
        particles[i].draw();
      }
    }

    // draw all entities
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].onScreen()) {
        entities[i].draw();
      }
    }
    // restore drawing context
    this.context.restore();

    // copy the drawing canvas onto the blur canvas
    this.blurContext.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width / BLUR_SCALAR,
      this.canvas.height / BLUR_SCALAR
    );

    // align camera, draw the gui, reset camera
    // this is after the draw canvas is copied to the blur canvas
    // move this to before if you want the gui blurred
    const originalOffset = this.cameraOffset;
    this.cameraOffset = new Vector(0, 0);
    for (const guiKey of guiElements.keys()) {
      if (guiElements.get(guiKey).active) {
        guiElements.get(guiKey).draw();
      }
    }
    this.cameraOffset = originalOffset;

    // copy the blur canvas onto the display canvas
    this.displayContext.drawImage(
      this.blurCanvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );

    // save display context
    this.displayContext.save();
    this.displayContext.globalCompositeOperation = "lighter";
    // copy the drawing canvas onto the display canvas
    this.displayContext.drawImage(
      this.canvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );

    // restore display context
    this.displayContext.restore();
  }
}

const displayManager = new DisplayManager();

/**
 * adds the display canvas to the div in the DOM with the given id
 * @param {string} id
 */
export function addDisplayToDiv(id) {
  const displayDiv = document.getElementById(id);
  displayDiv.appendChild(displayManager.displayCanvas);
}

/**
 * returns the draw canvas
 */
export function getCanvas() {
  return displayManager.canvas;
}

/**
 * returns the draw context
 */
export function getContext() {
  return displayManager.context;
}

/**
 * returns the splatter context
 */
export function getSplatterContext() {
  return displayManager.splatterContext;
}

/**
 * returns the blur context
 */
export function getBlurContext() {
  return displayManager.blurContext;
}

/**
 * returns the draw canvas width
 */
export function getCanvasWidth() {
  return displayManager.canvas.width;
}

/**
 * returns the draw canvas height
 */
export function getCanvasHeight() {
  return displayManager.canvas.height;
}

// TODO is this redundant with getCanvasWidth and Height?
/**
 * return an object with info about screen dimensions
 * @returns {{width: number, height: number}}
 */
export function getScreenDimensions() {
  return {
    width: displayManager.screenWidth,
    height: displayManager.screenHeight
  };
}

/**
 * set the additional draw function to happen every game loop (would be
 * commonly used for drawing terrain)
 * @param {() => void} drawFunc drawing function to happen every loop
 */
export function setGameDrawFunc(drawFunc) {
  displayManager.drawFunc = drawFunc;
}

/**
 * get the camera offset
 */
export function getCameraOffset() {
  return displayManager.cameraOffset;
}

/**
 * set the camera offset
 * @param {Vector} cameraOffset
 */
export function setCameraOffset(cameraOffset) {
  displayManager.cameraOffset = cameraOffset;
}

/**
 * @returns {Promise<void>}
 */
export function toggleFullscreen() {
  if (document.fullscreenElement === null) {
    // enter fullscreen
    displayManager.displayCanvas.width = displayManager.screenWidth;
    displayManager.displayCanvas.height = displayManager.screenHeight;
    settings["Fullscreen"].value = true;
    return displayManager.enterFullscreen();
  } else {
    // exit fullscreen
    settings["Fullscreen"].value = false;
    return document.exitFullscreen();
  }
}

/**
 * draw all the entities and particles
 * @param {Entity[]} entities
 * @param {Entity[]} particles
 * @param {Map<string, GuiElement>} guiElements
 */
export function drawGame(entities, particles, guiElements) {
  displayManager.drawGame(entities, particles, guiElements);
}

/**
 * set the size of the splatter canvas (call to fit the size of the world)
 * @param {number} width
 * @param {number} height
 */
export function setSplatterSize(width, height) {
  displayManager.splatterCanvas.width = width;
  displayManager.splatterCanvas.height = height;
}
