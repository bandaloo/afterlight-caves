import { Vector } from "./vector.js";

const noisy = false;
const DEADZONE = 0.2;
const STICK_SENSITIVITY = 1.4;
let usingKeyboard = true;

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
   * @param {string} key the KeyboardEvent.key value of the key associated with
   * this button. See here for details:
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
   * @param {number} [gpButtonIndex] index in gamepad.buttons. Only has effect
   * if this has type "button"
   */
  constructor(key, gpButtonIndex) {
    this.key = key;
    this.status = initStatus();
    this.gpButtonIndex = gpButtonIndex;
  }
}

class Directional {
  /**
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
  constructor(upKey, rightKey, downKey, leftKey, vAxisIndex, hAxisIndex) {
    this.up = new Button(upKey);
    this.right = new Button(rightKey);
    this.down = new Button(downKey);
    this.left = new Button(leftKey);
    this.vAxisIndex = vAxisIndex;
    this.hAxisIndex = hAxisIndex;
    this.vec = new Vector(0, 0);
  }

  /**
   * Sets this vec for a directional based on what buttons are being pressed
   */
  setVecFromButtons() {
    this.vec = new Vector(0, 0);
    if (this.left.status.isDown) this.vec.x -= 1;
    if (this.right.status.isDown) this.vec.x += 1;
    if (this.up.status.isDown) this.vec.y -= 1;
    if (this.down.status.isDown) this.vec.y += 1;
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
  move: new Directional("w", "d", "s", "a", 1, 0),

  shoot: new Directional(
    "ArrowUp",
    "ArrowRight",
    "ArrowDown",
    "ArrowLeft",
    3,
    2
  ),

  /** @type {Button} */
  primary: new Button(" ", 4),
  /** @type {Button} */
  secondary: new Button("e", 5),
  /** @type {Button} */
  pause: new Button("p", 8),

  /** @return {Directional[]} */
  getDirectionals() {
    return [this.move, this.shoot];
  },

  /** @return {Button[]} */
  getButtons() {
    return [this.primary, this.secondary, this.pause];
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
  const key = e.key;

  // is it a stick button?
  for (const stick of buttons.getDirectionals()) {
    for (const dir of stick.getButtons()) {
      if (key === dir.key) {
        e.preventDefault();
        buttonDown(dir);
        stick.setVecFromButtons();
      }
    }
  }

  // is it a normal button?
  for (const nb of buttons.getButtons()) {
    if (key === nb.key) {
      e.preventDefault();
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
  const key = e.key;

  // is it a stick button?
  for (const stick of buttons.getDirectionals()) {
    for (const dir of stick.getButtons()) {
      if (key === dir.key) {
        e.preventDefault();
        buttonUp(dir);
        stick.setVecFromButtons();
      }
    }
  }

  // is it a normal button?
  for (const nb of buttons.getButtons()) {
    if (key === nb.key) {
      e.preventDefault();
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
  /**
   * @param {number} x
   * @return {number} 0 if x is within DEADZONE of 0, otherwise x
   */
  const deadzoneGuard = x => {
    return Math.abs(x) > DEADZONE ? x : 0;
  };

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
