const packager = require("electron-packager");
const installerRedHat = require("electron-installer-redhat");
const fs = require("fs").promises;
const fse = require("fs-extra");
const path = require("path");

/**
 * builds a desktop version of the game, but does not package it as a standalone
 * application
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const buildElectron = (
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Building Electron version...");
  return new Promise(resolve => {
    buildProd(scoreServerScheme, scoreServerDomain)
      .then(() =>
        fse.copy(
          path.join("electron-files", "index.html"),
          path.join("dist", "index.html")
        )
      )
      .then(() =>
        fse.copy(
          path.join("electron-files", "style.css"),
          path.join("dist", "style.css")
        )
      )
      .then(() =>
        fse.copy(
          path.join("electron-files", "enable-cookies.js"),
          path.join("dist", "enable-cookies.js")
        )
      )
      .then(() => {
        console.log("Electron version created at dist");
        resolve();
      })
      .catch(reason => {
        console.error("Error encountered in buildElectron:");
        console.error(reason);
      });
  });
};

/**
 * builds a desktop version of the game, and packages it as an executable
 * for various platforms
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const packageDesktop = (
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Packaging as Electron app bundles...");
  return new Promise(resolve => {
    buildElectron(scoreServerScheme, scoreServerDomain)
      .then(() =>
        packager({
          dir: ".",
          name: "afterlight-caves",
          out: "release-builds",
          overwrite: true,
          platform: "all",
          arch: "x64",
          icon: path.join("static", "images", "logo"),
          prune: true
        })
      )
      .then(appPaths => {
        console.log(`Electron app bundles created at:\n${appPaths.join("\n")}`);
        resolve();
      })
      .catch(reason => {
        console.error("Error encountered in buildElectron:");
        console.error(reason);
      });
  });
};

/**
 * builds a desktop version of the game, and packages it as an RPM file
 * @param{any} options options for electron-installer-redhat
 * @param{string} scoreServerScheme scheme for custom score server, e.g. "https"
 * @param{string} scoreServerDomain domain for custom score server, e.g. "example.com"
 * @return{Promise<void>}
 */
const packageRpm = (
  options,
  scoreServerScheme = undefined,
  scoreServerDomain = undefined
) => {
  console.log("Packaging as RPM file...");
  return new Promise(resolve => {
    packageDesktop(scoreServerScheme, scoreServerDomain)
      .then(() => installerRedHat(options))
      .then(() => {
        console.error("RPM file created at release-builds");
        resolve()
      })
      .catch(reason => {
        console.error("Error encountered in packageRpm");
        console.error(reason);
      });
  });
};

/**
 * removes a list of directories
 * @param{string[]} toRemove directories to remove
 */
const cleanDirs = toRemove => {
  console.log(
    "Removing the following directories: " +
      toRemove.reduce((prev, cur) => `${prev}, ${cur}`)
  );

  // this fold removes each directory in a row
  toRemove.reduce((prev, cur) => {
    return prev.then(() => fs.rmdir(cur, { recursive: true }));
  }, Promise.resolve());
};

module.exports = {
  buildElectron,
  cleanDirs,
  packageDesktop,
  packageRpm
};
