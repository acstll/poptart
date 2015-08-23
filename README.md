# Poptart

JavaScript client-side router.

## Install

With [npm](http://npmjs.org) do:

```bash
npm install acstll/poptart --save
```

you see this is not on the npm registry yet.

## Usage

```js
var createRouter = require('poptart-router')
var history = require('history')()

var router = createRouter(history)

function callback (obj, next) {
  var name = obj.params.name; // url params
  var foo = obj.location.state.foo; // your state object
  
  // history's location object is available
  // http://rackt.github.io/history/stable/Location.html

  console.log(name)
  console.log(foo)
  
  next() // allow the next callback to fire
}

router.add('hello', '/hello/:name', callback)

router.start()

router.navigate('hello', { name: 'world' }, {
  state: { foo: 'bar' }
})

// => "world"
// => "bar"
```

## API

### createRouter

`createRouter(history[, base, callback])`

- `history` [history](http://npm.im/history)
- `base` (String) should be set in case you're not operating at the root path `/` of the domain.
- `callback` is fired after all callbacks of every matched route have been called. It should follow this signature `function (err, obj) {}`.

### \#add

`router.add(name, path[, callback...])`

You can add as many callbacks as you need. This is internally handled by the [`ware`](https://www.npmjs.org/package/ware) module, so the callback signature should be the following:

`function (obj, next) {}`

Remember to call `next` when you're done so the next callback in line can be fired.

Routes are matched in the order they were `add`ed, and they are matched using the famous [`path-to-regexp`](https://www.npmjs.org/package/path-to-regexp) module, used by Express among many others, so regular expressions are supported and all that.

Please check out the `path-to-regexp` [documentation](https://github.com/pillarjs/path-to-regexp#parameters) to know more about route options.

Also checkout the [live demo](http://forbeslindesay.github.io/express-route-tester/) (pretty useful)!

### \#route

`add` alias.

### \#start

`router.start()`

Router starts listening for `popstate` events.

### \#navigate

`router.navigate(name[, params, options])`

- `name` The route name
- `params` Object…

Options being:

- `state`: Object. The state you want to keep in History for that path.
- `replace`: Boolean. Call `replaceState` instead of `pushState` on `history`. (Default: false).

This will update the browser's URL and fire any callbacks.

### \#stop

`router.stop()`

Stop listening for `popstate` events.

## License

MIT
