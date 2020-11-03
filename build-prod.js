/**
 * This script builds a production version of the game, compatible with
 * older and more obscure browsers
 */

const buildTools = require("./build-tools.js");

/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_SCHEME = undefined; // e.g. "https";
/** @type{string} set these values to use a custom score server */
const SCORE_SERVER_DOMAIN = undefined; // e.g. "example.com";

buildTools.buildProd(SCORE_SERVER_SCHEME, SCORE_SERVER_DOMAIN).then();
