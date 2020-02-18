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
      return document.fullscreenElement !== null ? "on" : "off";
    },
    onClick() {
      toggleFullscreen();
    }
  },
  "Mute music": {
    value: false,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      if (this.value) {
        pauseSound("captive-portal");
      } else {
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
    }
  },
  "Camera following strategy": {
    value: true,
    getDisplayVal() {
      return this.value ? "tight" : "loose";
    },
    onClick() {
      return (this.value = !this.value);
    }
  },
  "Glow effect": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
      this.value
        ? (getBlurContext().filter = FILTER_STRING)
        : (getBlurContext().filter = "none");
    }
  },
  "Splatter effects": {
    value: true,
    getDisplayVal() {
      return this.value ? "on" : "off";
    },
    onClick() {
      this.value = !this.value;
    }
  }
};
