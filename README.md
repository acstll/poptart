Some JavaScript client-side router.

## Install

With [npm](http://npmjs.org) do:

```bash
npm install poptart-router history --save
```

You also need the [`history`](http://npm.im/history) module.

## Usage

```js
var createRouter = require('poptart-router')
var history = require('history')()

var router = createRouter(history)

function callback (location, next) {
  // That is history's location object
  // https://github.com/ReactJSTraining/history/blob/master/docs/Location.md

  var name = location.params.name; // url params
  var foo = location.state.foo; // your state object
  
  console.log(name)
  console.log(foo)
  
  next() // allow the callback chain go forward
}

router.add('/hello/:name', callback)

router.start()

router.push({
  pathname: router.generate('/hello/:name', { name: 'world' })
  state: { foo: 'bar' }
})

// => "world"
// => "bar"
```

## API

### createRouter

`createRouter(history[, base, callback])`

- `history` A [history](http://npm.im/history) object.
- `base` (String) should be set in case you're not operating at the root path `/` of the domain.
- `callback` is fired after all callbacks of every matched route have been called. It should follow this signature `function (err, location) {}`.

### \#add

`router.add(path[, callback...])`

You can add as many callbacks as you need. This is internally handled by the [`ware`](https://www.npmjs.org/package/ware) module, so the callback signature should be the following:

`function (location, next) {}`

Remember to call `next` when you're done so the next callback in line can be fired.

Routes are matched in the order they were `add`ed, and they are matched using the famous [`path-to-regexp`](https://www.npmjs.org/package/path-to-regexp) module, used by Express among many others, so regular expressions are supported and all that.

Please check out the `path-to-regexp` [documentation](https://github.com/pillarjs/path-to-regexp#parameters) to know more about route options. Also checkout the [live demo](http://forbeslindesay.github.io/express-route-tester/)!

### \#route

`add` alias.

### \#start

`router.start([immediately])`

Router starts listening for route changes.

For `immediately` pass `false` if you want to skip parsing the current location at `start`.  

### \#push

`router.push(location)`

A wrapper around `history.push`, where `location` is [that one from the `history` module](https://github.com/ReactJSTraining/history/blob/master/docs/Location.md).

This will update the browser's URL and fire any callbacks.

### \#replace

`router.replace(location)`

Same as `push` but using `replaceState`...

### \#stop

`router.stop()`

Stop listening for changes.

## License

MIT
