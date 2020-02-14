import { Vector } from "./vector";

const BLUR_SCALAR = 2;

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

// TODO move this to DisplayManager
/**
 * @returns {Promise<void>}
 */
export function toggleFullscreen() {
  if (document.fullscreenElement === null) {
    // enter fullscreen
    displayManager.displayCanvas.width = this.screenWidth;
    displayManager.displayCanvas.height = this.screenHeight;
    return this.enterFullscreen();
  } else {
    // exit fullscreen
    return document.exitFullscreen();
  }
}
