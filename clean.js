/**
 * This script removes intermediate and final build files
 */

const fs = require("fs").promises;

const toRemove = [
  "build",
  "dist",
  "release-builds"
];

console.log("Removing the following directories: " +
  toRemove.reduce((prev, cur) => `${prev}, ${cur}`));

// this fold removes each directory in a row
toRemove.reduce((prev, cur) => {
  return prev.then(() => fs.rmdir(cur, { recursive: true }));
}, Promise.resolve());
