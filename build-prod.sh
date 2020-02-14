#!/bin/bash

node_modules/.bin/babel static --out-dir build
node_modules/.bin/browserify -vd build/main.js -o dist/bundle.js
cp static/index.html dist/
cp static/style.css dist/
cp static/license.txt dist/
sed -i 's/<script type="module" src="main.js"/<script src="bundle.js"/g' dist/index.html
cp static/sounds dist/sounds -r
rm -r build
