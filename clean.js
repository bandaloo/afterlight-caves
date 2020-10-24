/**
 * This script removes intermediate and final build files
 */

const buildTools = require("./build-tools.js");

const toRemove = [
  "build",
  "dist",
  "release-builds"
];

buildTools.cleanDirs(toRemove);

