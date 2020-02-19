import { pauseSound, loopSound, getSound } from "../modules/sound.js";
import {
  getBlurContext,
  FILTER_STRING,
  toggleFullscreen
} from "../modules/displaymanager.js";

export const settings = {
  Fullscreen: {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      this.update();
    },
    update() {
      if (
        (this.value && document.fullscreenElement === null) ||
        (!this.value && document.fullscreenElement !== null)
      ) {
        toggleFullscreen();
      }
    }
  },
  "Mute music": {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      this.update();
      saveSettings();
    },
    update() {
      pauseSound("captive-portal");
      if (!this.value) {
        loopSound("captive-portal");
        getSound("captive-portal").play();
      }
    }
  },
  "Mute sound effects": {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      saveSettings();
    },
    update() {
      return;
    }
  },
  "Camera following strategy": {
    value: true,
    getDisplayVal() {
      return this.value ? "tight" : "loose";
    },
    onClick() {
      this.value = !this.value;
      saveSettings();
    },
    update() {
      return;
    }
  },
  "Glow effect": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      this.update();
      saveSettings();
    },
    update() {
      if (this.value) getBlurContext().filter = FILTER_STRING;
      else getBlurContext().filter = "none";
    }
  },
  "Splatter effects": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      saveSettings();
    },
    update() {
      return;
    }
  }
};

/**
 * saves the settings as a cookie that expires after 7 days
 */
export function saveSettings() {
  // create date one week in the future
  const date = new Date();
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
  // turn settings into a string
  const json = {};
  for (const key in settings) {
    // don't remember fullscreen setting. It causes weird behavior if you reload
    // the page and it tries to immediately enter fullscreen again
    if (key !== "Fullscreen")
      json[key] = settings[key].value;
  }
  const settingsString = JSON.stringify(json);
  document.cookie = "settings=" + settingsString + "; expires = " + date.toUTCString() + "; path=/;";
}

/**
 * restores settings based on cookie value, if it exists
 */
export function restoreSettings() {
  const parts = document.cookie.split(";");
  for (const part of parts) {
    if (part.trim().indexOf("settings=" === 0)) {
      try {
        const json = JSON.parse(part.trim().substring("settings=".length));
        for (const key in json) {
          if (settings[key] !== undefined) {
            settings[key].value = json[key];
            settings[key].update();
          }
        }
      } catch (e) {
        // ignore errors
      }
    }
  }
}
