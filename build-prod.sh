#!/bin/bash

npm run compile-compat && npm run browserify-compat
cp static/index.html dist/
cp static/style.css dist/
cp static/license.txt dist/
cp static/favicon.ico dist/
cp static/anonymous-pro-b.ttf dist/
sed -i --posix 's/<script type="module" src="main.js"/<script src="bundle.js"/g' dist/index.html
cp -r static/sounds dist/
cp -r static/images dist/
rm -r build
