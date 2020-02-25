# Afterlight Caves

Created by
[Cole Granof](https://www.bandaloo.fun),
[Joseph Petitti](https://josephpetitti.com), and
[Matthew Puentes](https://mattpuentes.com)

This is a cool game where you shoot procedurally generated enemies in
procedurally generated caves. Try it online at
[afterlightcaves.com](https://afterlightcaves.com).

## Try it out

The best way to try out this project is to run a Node server that serves the
static content. With Node.js installed, do this:

```
$ git clone https://github.com/bandaloo/afterlight-caves
$ cd proc-cave-game
$ npm install
$ npm start
```

Then point your favorite browser to `http://localhost:4000` to try it out.

## Development

We use no front-end dependencies, everything in the `static` directory can be
run as plain JavaScript in a modern browser. We use ES6 modules directly since
they've been in the standard for a long time now.

We wrote all the engine code, game logic, and graphics from scratch using
nothing but JavaScript. We use the HTML canvas API for graphics and various
other standard web APIs for input and sound.

We also use the [Prettier](https://prettier.io/) code formatter to simplify
things.

## Build a production version

The JavaScript syntax we use is only supported by very recent browsers. To
build a version that is compatible with more older and more obscure browsers,
use the build script:

```
$ npm run build
```

This uses [Babel](https://babeljs.io/) to transpile our scripts to ES5, then
bundles them with [Browserify](http://browserify.org) and writes the output to
the `dist` directory. You can tell the server to serve files from the `dist`
directory instead of `static` by doing this:

```
node index.js --compat
```

The `start-compat` npm script builds and serves from the `dist` directory
automatically.

## Testing

We use Mocha and Chai in the browser to test with ES6 modules. This was set up
with the help of [this article](https://medium.com/dailyjs/running-mocha-tests-as-native-es6-modules-in-a-browser-882373f2ecb0).

The easiest way to run the tests is to launch a local server and open
`tests.html` in your browser.

## Music credits

  - ["Captive Portal" by Me As](https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Captive_Portal/Toy_Sounds_Vol_1/Captive_Portal_-_02_-_Me_As.mp3)
