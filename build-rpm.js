/**
 * This script builds a desktop version of the game, and packages it as an
 * RPM file for RedHat-compatible systems, e.g. Fedora, RHEL, OpenSUSE
 */

const buildTools = require("./build-tools.js");

const OPTIONS = {
  "src": "release-builds/afterlight-caves-linux-x64",
  "dest": "release-builds",
  "productName": "Afterlight Caves",
  "genericName": "Action Game",
  "description": "Procedurally generated cave game",
  "productDescription": "A procedurally generated top-down twin-stick shooter game for the web.",
  "arch": "x86_64",
  "icon": {
    "16x16": "dist/images/favicon-16.png",
    "32x32": "dist/images/favicon-32.png",
    "96x96": "dist/images/favicon-96.png",
    "192x192": "dist/images/favicon-192.png",
    "250x250": "dist/images/favicon-250.png",
    "scalable": "dist/images/logo.svg"
  },
  "categories": ["Game"]
};

/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_SCHEME = "https";
/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_DOMAIN = "afterlightcaves.com";

buildTools.packageRpm(OPTIONS, SCORE_SERVER_SCHEME, SCORE_SERVER_DOMAIN).then();
