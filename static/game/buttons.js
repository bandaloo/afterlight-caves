const noisy = false;

/**
 * Initializes a sub-object for buttons
 * @return {{held: boolean, pressed: boolean, released: boolean}}
 */
function initBut() {
  return {
    held: false,
    pressed: false,
    released: false
  };
}

/**
 * object with sub-objects with booleans for each button we care about that say
 * whether it was just held, pressed, or released
 */
export const buttons = {
  move: {
    up: { key: "W", status: initBut() },
    right: { key: "D", status: initBut() },
    down: { key: "S", status: initBut() },
    left: { key: "A", status: initBut() }
  },

  shoot: {
    up: { key: "&", status: initBut() },
    right: { key: "'", status: initBut() },
    down: { key: "(", status: initBut() },
    left: { key: "%", status: initBut() }
  },

  primary: { key: " ", status: initBut() },
  secondary: { key: "E", status: initBut() }
};

/**
 * function for dealing with keydown events
 * @param {KeyboardEvent} e the keydown keyboard event
 */
export function controlKeydownListener(e) {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    if (key === buttons.move[dir].key) {
      e.preventDefault();
      if (!buttons.move[dir].status.held) {
        buttons.move[dir].status.pressed = true;
        if (noisy) {
          console.log(`move button ${buttons.move[dir].key} pressed`);
        }
      }
      buttons.move[dir].status.held = true;
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    //console.log("key " + key);
    //console.log("code " + code);
    if (key === buttons.shoot[dir].key) {
      e.preventDefault();
      if (!buttons.shoot[dir].status.held) {
        buttons.shoot[dir].status.pressed = true;
        if (noisy) {
          console.log(`shoot button ${buttons.shoot[dir].key} pressed`);
        }
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
      if (noisy) {
        console.log(`primary button ${buttons.primary.key} pressed`);
      }
    }
    buttons.primary.status.held = true;
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    if (!buttons.secondary.status.held) {
      buttons.secondary.status.pressed = true;
      if (noisy) {
        console.log(`secondary button ${buttons.primary.key} pressed`);
      }
    }
    buttons.secondary.status.held = true;
    return;
  }
}

/**
 * function for dealing with keyup events
 * @param {KeyboardEvent} e the keyup keyboard event
 */
export function controlKeyupListener(e) {
  const code = e.keyCode;
  const key = String.fromCharCode(code);

  // movement keys
  for (const dir in buttons.move) {
    e.preventDefault();
    if (key === buttons.move[dir].key) {
      buttons.move[dir].status.pressed = false;
      buttons.move[dir].status.held = false;
      buttons.move[dir].status.released = true;
      if (noisy) {
        console.log(`move button ${buttons.move[dir].key} released`);
      }
      return;
    }
  }

  // shooting keys
  for (const dir in buttons.shoot) {
    e.preventDefault();
    if (key === buttons.shoot[dir].key) {
      buttons.shoot[dir].status.pressed = false;
      buttons.shoot[dir].status.held = false;
      buttons.shoot[dir].status.released = true;
      if (noisy) {
        console.log(`shoot button ${buttons.shoot[dir].key} released`);
      }
      return;
    }
  }

  // primary and secondary keys
  if (key === buttons.primary.key) {
    e.preventDefault();
    buttons.primary.status.pressed = false;
    buttons.primary.status.held = false;
    buttons.primary.status.released = true;
    if (noisy) {
      console.log(`primary button ${buttons.primary.key} released`);
    }
    return;
  }
  if (key === buttons.secondary.key) {
    e.preventDefault();
    buttons.secondary.status.pressed = false;
    buttons.secondary.status.held = false;
    buttons.secondary.status.released = true;
    if (noisy) {
      console.log(`secondary button ${buttons.secondary.key} released`);
    }
    return;
  }
}
