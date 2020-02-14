class DisplayManager {}

const displayManager = new DisplayManager();

/**
 * adds the display canvas to the div in the DOM with the given id
 */
export function addDisplayToDiv(id) {}

/**
 * returns the draw canvas
 */
export function getCanvas() {}

/**
 * returns the draw context
 */
export function getContext() {}

/**
 * returns the splatter context
 */
export function getSplatterContext() {}

/**
 * returns the draw canvas width
 */
export function getCanvasWidth() {}

/**
 * returns the draw canvas height
 */
export function getCanvasHeight() {}

/**
 * set the additional draw function to happen every game loop (would be
 * commonly used for drawing terrain)
 * @param {() => void} drawFunc drawing function to happen every loop
 */
export function setGameDrawFunc(drawFunc) {}
