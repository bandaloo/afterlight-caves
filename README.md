# Submission for PROCJAM 2019

This is a cool game where you should procedurally generated enemies in
procedurally generated caves.

## Development

I don't use any front end build tools. Instead, I just use Javascript modules
directly since they've been in the standard for a long time now. Hopefully
someday bundlers will become not so important anyway.

I also use the Prettier code formatter to simplify things.

## Running

The best way to try out this project is to run a Node server that serves the
static content. With node.js installed, do this:

```
$ npm install
$ npm start
```

Then navigate to `http://localhost:4000` to try it out.

## Testing

I use Mocha and Chai in the browser to test with ES6 modules. This was set up
with the help of this:
<https://medium.com/dailyjs/running-mocha-tests-as-native-es6-modules-in-a-browser-882373f2ecb0>

The easiest way to run the tests is to launch a local server and open
`tests.html` in your browser.
