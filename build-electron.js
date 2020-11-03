/**
 * This script builds a desktop version of the game, but does not package it
 * as a standalone application
 */

const buildTools = require("./build-tools.js");

/** @type{string} change these values to use a custom score server */
const SCORE_SERVER_SCHEME = "https";
/** @type{string} change these values to use a custom score server */
const SCORE_SERVER_DOMAIN = "afterlightcaves.com";

buildTools.buildElectron(SCORE_SERVER_SCHEME, SCORE_SERVER_DOMAIN).then();

