/**
 * This script builds a desktop version and packages it into executables
 * for various platforms
 */

const buildTools = require("./build-tools.js");

/** @type{string} change these values to use a custom score server */
const SCORE_SERVER_SCHEME = "https";
/** @type{string} change these values to use a custom score server */
const SCORE_SERVER_DOMAIN = "afterlightcaves.com";

buildTools.packageDesktop(SCORE_SERVER_SCHEME, SCORE_SERVER_DOMAIN).then();
