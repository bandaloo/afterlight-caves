import { Vector } from "./vector.js";
import { collectInput } from "./gamemanager.js";

const noisy = false;
const DEADZONE = 0.2;
const STICK_SENSITIVITY = 1.4;
let usingKeyboard = true;
let ignoreGampad = false;

/**
 * @return {boolean} whether the player is using a keyboard (as opposed to a
 * controller)
 */
export const getUsingKeyboard = () => {
  return usingKeyboard;
};

/**
 * Set to true to ignore input from gamepads
 * @param {boolean} [arg] true if omitted
 */
export const suppressGamepad = (arg = true) => {
  ignoreGampad = arg;
};

/**
 * @param {number} x
 * @return {number} 0 if x is within DEADZONE of 0, otherwise x
 */
const deadzoneGuard = x => {
  return Math.abs(x) > DEADZONE ? x : 0;
};

/**
 * @typedef {Object} Status
 * @property {boolean} isDown if the key is down
 * @property {boolean} wasDown if the key was down last step
 * @property {boolean} isPressed if the key is down, and was up last step
 * @property {boolean} isHeld if the key is down, and was down last step
 * @property {boolean} isReleased if the key is up, and was down last step
 */

class Button {
  /**
   * @param {string} name the display name of this button
   * @param {string} key the KeyboardEvent.key value of the key associated with
   * this button. See here for details:
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
   * @param {number} [gpButtonIndex] index in gamepad.buttons. Only has effect
   * if this has type "button"
   */
  constructor(name, key, gpButtonIndex) {
    this.name = name;
    this.key = key;
    this.status = initStatus();
    this.gpButtonIndex = gpButtonIndex;
  }
}

export class Directional {
  /**
   * @param {string} name the display name of this directional
   * @param {string} upKey the KeyboardEvent.key value of the key associated
   * with going up on this directional
   * @param {string} rightKey the KeyboardEvent.key value of the key associated
   * with going right on this directional
   * @param {string} downKey the KeyboardEvent.key value of the key associated
   * with going down on this directional
   * @param {string} leftKey the KeyboardEvent.key value of the key associated
   * with going left on this directional
   * @param {number} vAxisIndex index of this directional's vertical axis in
   * gamepad.axes
   * @param {number} hAxisIndex index of this directional's horizontal axis
   * in gamepad.axes
   */
  constructor(name, upKey, rightKey, downKey, leftKey, vAxisIndex, hAxisIndex) {
    this.name = name;
    this.up = new Button(this.name + " up", upKey);
    this.right = new Button(this.name + " right", rightKey);
    this.down = new Button(this.name + " down", downKey);
    this.left = new Button(this.name + " left", leftKey);
    this.vAxisIndex = vAxisIndex;
    this.hAxisIndex = hAxisIndex;
    this.invertHAxis = false;
    this.invertVAxis = false;
    /** @type {Vector} */
    this.vec = new Vector(0, 0);
  }

  /**
   * Sets this vec for a directional based on what buttons are being pressed
   */
  setVecFromButtons() {
    // temporarily make all values 1
    this.vec.x = Math.sign(this.vec.x);
    this.vec.y = Math.sign(this.vec.y);

    // set the vec based on key presses
    if (this.left.status.isPressed) this.vec.x = -1;
    if (this.right.status.isPressed) this.vec.x = 1;
    if (this.up.status.isPressed) this.vec.y = -1;
    if (this.down.status.isPressed) this.vec.y = 1;

    // adjust the vec based on key releases
    if (this.left.status.isReleased) {
      if (this.right.status.isDown) this.vec.x = 1;
      else this.vec.x = 0;
    }
    if (this.right.status.isReleased) {
      if (this.left.status.isDown) this.vec.x = -1;
      else this.vec.x = 0;
    }
    if (this.up.status.isReleased) {
      if (this.down.status.isDown) this.vec.y = 1;
      else this.vec.y = 0;
    }
    if (this.down.status.isReleased) {
      if (this.up.status.isDown) this.vec.y = -1;
      else this.vec.y = 0;
    }

    // normalize (all components of vec were made 1, -1 and 0 before)
    this.vec = this.vec.norm2();
  }

  /**
   * @return {Button[]} an array of this directional's Button objects
   */
  getButtons() {
    return [this.up, this.right, this.down, this.left];
  }
}

/**
 * Initializes a status to all false
 * @return {Status}
 */
function initStatus() {
  return {
    isDown: false,
    wasDown: false,
    isPressed: false,
    isHeld: false,
    isReleased: false
  };
}

/**
 * object with sub-objects with booleans for each button we care about that say
 * whether it was just held, pressed, or released
 */
export const buttons = {
  move: new Directional("Move", "w", "d", "s", "a", 1, 0),

  shoot: new Directional(
    "Shoot",
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    3,
    2
  ),

  primary: new Button("Bomb", " ", 4),
  secondary: new Button("Secondary", "e", 5),
  select: new Button("Select", " ", 0),
  back: new Button("Back", "Tab", 1),
  fullscreen: new Button("Fullscreen", "f", 3),
  pause: new Button("Pause", "p", 9),
  reset: new Button("Reset", "r", 8),

  /** @return {Directional[]} */
  getDirectionals() {
    return [this.move, this.shoot];
  },

  /** @return {Button[]} */
  getButtons() {
    return [
      this.primary,
      this.secondary,
      this.select,
      this.back,
      this.fullscreen,
      this.pause,
      this.reset
    ];
  },

  *[Symbol.iterator]() {
    for (const dir of this.getDirectionals()) {
      for (const b of dir.getButtons()) {
        yield b;
      }
    }
    for (const button of this.getButtons()) {
      yield button;
    }
  }
};

/**
 * Let buttons know that a step has just finished
 */
export function ageButtons() {
  for (const button of buttons) {
    // assume no change
    button.status.wasDown = button.status.isDown;
    button.status.isReleased = false;
    button.status.isHeld = button.status.isDown;
    button.status.isPressed = false;
  }
}

/**
 * Call this when a button has just been pressed
 * @param {Button} button
 */
function buttonDown(button) {
  button.status.isDown = true;
  button.status.isHeld = button.status.wasDown;
  button.status.isPressed = !button.status.wasDown;
  button.status.isReleased = false;
}

/**
 * Call this when a button has just been released
 * @param {Button} button
 */
function buttonUp(button) {
  button.status.isDown = false;
  button.status.isHeld = false;
  button.status.isPressed = false;
  button.status.isReleased = button.status.wasDown;
}

/**
 * This gets called each step before ageButton() *if* usingKeyboard is false
 * @param {Button} button
 * @param {boolean} [currentlyDown = false]
 */
function buttonStep(button, currentlyDown = false) {
  button.status.isDown = currentlyDown;
  button.status.isHeld = currentlyDown && button.status.wasDown;
  button.status.isPressed = currentlyDown && !button.status.wasDown;
  button.status.isReleased = !currentlyDown && button.status.wasDown;
}

/**
 * function for dealing with keydown events
 * @param {KeyboardEvent} e the keydown keyboard event
 */
export function controlKeydownListener(e) {
  usingKeyboard = true;
  const key = e.key.toLowerCase();

  // is it a stick button?
  for (const stick of buttons.getDirectionals()) {
    for (const dir of stick.getButtons()) {
      if (key === dir.key.toLowerCase()) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) e.preventDefault();
        buttonDown(dir);
        stick.setVecFromButtons();
      }
    }
  }

  // is it a normal button?
  for (const nb of buttons.getButtons()) {
    if (key === nb.key.toLowerCase()) {
      if (!e.ctrlKey && !e.altKey && !e.metaKey) e.preventDefault();
      buttonDown(nb);
    }
  }
}

/**
 * function for dealing with keyup events
 * @param {KeyboardEvent} e the keyup keyboard event
 */
export function controlKeyupListener(e) {
  usingKeyboard = true;
  const key = e.key.toLowerCase();

  // is it a stick button?
  for (const stick of buttons.getDirectionals()) {
    for (const dir of stick.getButtons()) {
      if (key === dir.key.toLowerCase()) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) e.preventDefault();
        buttonUp(dir);
        stick.setVecFromButtons();
      }
    }
  }

  // is it a normal button?
  for (const nb of buttons.getButtons()) {
    if (key === nb.key.toLowerCase()) {
      if (!e.ctrlKey && !e.altKey && !e.metaKey) e.preventDefault();
      buttonUp(nb);
    }
  }
}

/**
 * handles connecting a gamepad
 * @param {GamepadEvent} e
 */
export function gamepadConnectListener(e) {
  if (noisy) console.log("GAMEPAD CONNECTED: " + e.gamepad.index);
  usingKeyboard = false;
}

/**
 * handles disconnecting a gamepad
 * @param {GamepadEvent} e
 */
export function gamepadDisconnectListener(e) {
  if (noisy) console.log("GAMEPAD DISCONNECTED: " + e.gamepad.index);
  usingKeyboard = true;
}

/**
 * this should be called every step to update buttons with input from the
 * controllers
 */
export function getGamepadInput() {
  if (ignoreGampad) return;

  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad || !gamepad.connected) {
      continue;
    }

    // check if any of the sticks we care about are pressed
    for (const dir of buttons.getDirectionals()) {
      const xai = dir.hAxisIndex;
      const yai = dir.vAxisIndex;
      if (xai !== undefined && gamepad.axes[xai]) {
        const reading = deadzoneGuard(gamepad.axes[xai]);
        if (reading !== 0) usingKeyboard = false;
      }
      if (yai !== undefined && gamepad.axes[yai]) {
        const reading = deadzoneGuard(gamepad.axes[yai]);
        if (reading !== 0) usingKeyboard = false;
      }
    }

    // check if any of the buttons we care about are pressed
    for (const but of buttons.getButtons()) {
      const bi = but.gpButtonIndex;
      if (bi !== undefined && gamepad.buttons[bi]) {
        if (gamepad.buttons[bi].value > 0 || gamepad.buttons[bi].pressed) {
          usingKeyboard = false;
        }
      }
    }

    // now, if we're not using the keyboard actually get the values from the
    // controller and assign them to buttons
    if (!usingKeyboard) {
      // get values from sticks
      for (const dir of buttons.getDirectionals()) {
        const xai = dir.hAxisIndex;
        const yai = dir.vAxisIndex;
        let xReading = 0;
        let yReading = 0;
        if (xai !== undefined && gamepad.axes[xai]) {
          xReading = deadzoneGuard(gamepad.axes[xai]);
        }
        if (yai !== undefined && gamepad.axes[yai]) {
          yReading = deadzoneGuard(gamepad.axes[yai]);
        }
        if (dir.invertHAxis) xReading *= -1;
        if (dir.invertVAxis) yReading *= -1;
        dir.vec = new Vector(xReading, yReading).mult(STICK_SENSITIVITY);
        if (dir.vec.mag() > 1) dir.vec = dir.vec.norm2();
      }

      // get values from buttons
      for (const but of buttons.getButtons()) {
        const bi = but.gpButtonIndex;
        if (bi !== undefined && gamepad.buttons[bi]) {
          buttonStep(
            but,
            gamepad.buttons[bi].value > 0 || gamepad.buttons[bi].pressed
          );
        }
      }
    }
  }
}

/**
 * Stops all other keyboard listeners and suppresses gamepad input to get the
 * next key pressed, then resumes collecting input normally
 * @return {Promise<string>} a promise that resolves with the name of the next
 * key pressed
 */
export async function getNextKey() {
  collectInput(false);
  suppressGamepad(true);
  return new Promise(resolve => {
    /** @param {KeyboardEvent} ev */
    const handler = ev => {
      document.removeEventListener("keydown", handler);
      collectInput(true);
      suppressGamepad(false);
      resolve(ev.key);
    };
    document.addEventListener("keydown", handler);
  });
}

/**
 * Stops all other keyboard listeners and suppresses gamepad input to get the
 * next gamepad button pressed, then resumes collecting input normally
 * @return {Promise<number | undefined>} a promise that resolves with the index
 * of the next gamepad button pressed, or undefined if we should keep the old
 * value
 */
export async function getNextGamepadButton() {
  suppressGamepad(true);
  return new Promise(resolve => {
    const startTime = window.performance.now();
    // loop for 5 seconds waiting for gamepad input
    const func = () => {
      // check all gamepads for input
      for (const gamepad of navigator.getGamepads()) {
        if (!gamepad || !gamepad.connected) continue;
        for (let i = 0; i < gamepad.buttons.length; ++i) {
          if (gamepad.buttons[i].pressed || gamepad.buttons[i].value > 0) {
            // set timeout to allow for the button to be released so it isn't
            // immediately triggered again
            setTimeout(() => suppressGamepad(false), 500);
            resolve(i);
            return;
          }
        }
      }
      if (window.performance.now() - startTime < 5000 && !usingKeyboard) {
        requestAnimationFrame(func);
      } else {
        // break out if it's been more than 5 seconds we're using the keyboard
        suppressGamepad(false);
        resolve(undefined);
        return;
      }
    };
    func();
  });
}

/**
 * Stops all other keyboard listeners and suppresses gamepad input to get the
 * next gamepad joystick pressed
 * @return {Promise<{ index: number, inverse: boolean } | undefined>} a promise
 * that resolves with the index of the next gamepad button pressed
 */
export async function getNextStickAxis() {
  suppressGamepad(true);
  return new Promise(resolve => {
    const startTime = window.performance.now();
    // loop for 5 seconds waiting for gamepad input
    const func = () => {
      // check all gamepads for input
      for (const gamepad of navigator.getGamepads()) {
        if (!gamepad || !gamepad.connected) continue;
        for (let i = 0; i < gamepad.axes.length; ++i) {
          if (deadzoneGuard(gamepad.axes[i]) !== 0) {
            // set timeout to allow for the button to be released so it isn't
            // immediately triggered again
            setTimeout(() => suppressGamepad(false), 300);
            resolve({ index: i, inverse: gamepad.axes[i] < 0 });
            return;
          }
        }
      }
      if (window.performance.now() - startTime < 5000 && !usingKeyboard) {
        requestAnimationFrame(func);
      } else {
        // break out if it's been more than 5 seconds we're using the keyboard
        suppressGamepad(false);
        resolve(undefined);
        return;
      }
    };
    func();
  });
}
