#!/bin/bash

# Change these if you want to run the score server on a different domain from
# the main content.
export SCORE_SERVER_SCHEME=https
export SCORE_SERVER_DOMAIN=afterlightcaves.com

./build-prod.sh

cp electron-files/index.html dist
cp electron-files/style.css dist
cp electron-files/enable-cookies.js dist
