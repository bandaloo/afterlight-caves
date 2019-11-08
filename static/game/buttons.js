/**
 * Initializes a sub-object for buttons
 * @return {{held: boolean, pressed: boolean, released: boolean}}
 */
const initBut = () => {
  return {
    held: false,
    pressed: false,
    released: false
  }
}

/**
 * object with sub-objects with booleans for each button we care about that say
 * whether it was just held, pressed, or released
 */
export const buttons = {
  move: {
    up: { key: 'w', status: initBut() },
    right: { key: 'd', status: initBut() },
    down: { key: 's', status: initBut() },
    left: { key: 'a', status: initBut() }
  },

  shoot: {
    up: { key: 'ArrowUp', status: initBut() },
    right: { key: 'ArrowRight', status: initBut() },
    down: { key: 'ArrowDown', status: initBut() },
    left: { key: 'ArrowLeft', status: initBut() }
  },

  primary: { key: ' ', status: initBut() },
  secondary: { key: 'e', status: initBut() }
};

/**
 * function for dealing with keydown events 
 * @param {KeyboardEvent} e the keydown keyboard event
 */
export const controlKeydownListener = (e) => {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    if (key === buttons.move[dir].key) {
      e.preventDefault();
      if (!buttons.move[dir].status.held) {
        buttons.move[dir].status.pressed = true;
      }
      buttons.move[dir].status.held = true;
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    if (key === buttons.shoot[dir].key) {
      e.preventDefault();
      if (!buttons.shoot[dir].status.held) {
        buttons.shoot[dir].status.pressed = true;
      }
      buttons.shoot[dir].status.held = true;
      return;
    }
  }

  // primary and secondary keys
  if (key === buttons.primary.key) {
    e.preventDefault();
    if (!buttons.primary.status.held) {
      buttons.primary.status.pressed = true;
    }
    buttons.primary.status.held = true;
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    if (!buttons.secondary.status.held) {
      buttons.secondary.status.pressed = true;
    }
    buttons.secondary.status.held = true;
    return;
  }
};

/**
 * function for dealing with keyup events 
 * @param {KeyboardEvent} e the keyup keyboard event
 */
export const controlKeyupListener = (e) => {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    e.preventDefault();
    if (key === buttons.move[dir].key) {
      buttons.move[dir].status.held = false;
      buttons.move[dir].status.released = true;
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    e.preventDefault();
    if (key === buttons.shoot[dir].key) {
      buttons.shoot[dir].status.held = false;
      buttons.shoot[dir].status.released = true;
      return;
    }
  }

  // primary and secondary keys
  if (key === buttons.primary.key) {
    e.preventDefault();
    buttons.primary.status.held = false;
    buttons.primary.status.released = true;
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    buttons.secondary.status.held = false;
    buttons.secondary.status.released = true;
    return;
  }
};
