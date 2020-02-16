# Afterlight Caves

Created by
[Cole Granof](http://www.bandaloo.fun),
[Joseph Petitti](https://josephpetitti.com), and
[Matthew Puentes](https://mattpuentes.com)

This is a cool game where you shoot procedurally generated enemies in
procedurally generated caves.

It was originally a submission for [PROCJAM 2019](https://www.procjam.com/), but
has since grown into a much bigger project.

## Try it out

The best way to try out this project is to run a Node server that serves the
static content. With node.js installed, do this:

```
$ git clone https://github.com/bandaloo/afterlight-caves
$ cd proc-cave-game
$ npm install
$ npm start
```

Then point your favorite browser to `http://localhost:4000` to try it out.

## Development

We don't use any front end build tools. Instead, we just use JavaScript modules
directly since they've been in the standard for a long time now. Hopefully
someday bundlers will become not so important anyway.

We also use the Prettier code formatter to simplify things.

## Testing

We use Mocha and Chai in the browser to test with ES6 modules. This was set up
with the help of [this article](https://medium.com/dailyjs/running-mocha-tests-as-native-es6-modules-in-a-browser-882373f2ecb0).

The easiest way to run the tests is to launch a local server and open
`tests.html` in your browser.

## Sound credits

  - ["Captive Portal" by Me As](https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Captive_Portal/Toy_Sounds_Vol_1/Captive_Portal_-_02_-_Me_As.mp3)
