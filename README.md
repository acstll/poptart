# Poptart

Yet another JavaScript client-side router. No hashchange support, only History.

## Install

With [npm](http://npmjs.org) do:

```bash
npm install acstll/poptart --save
```

you see this is not on the npm registry yet.

## Browser support

Anything that supports the `history` API. Namely modern browsers plus IE10 and up.
See [Can I use](http://caniuse.com/#search=history) for the `history` API.

## Usage

```js
var Router = require('poptart')

var router = new Router()

router.add('/hello/:name', function (obj, next) {
  var name = obj.params.name; // Url params
  var foo = obj.state.foo; // Your state object
  var event = obj.event; // Original `popstate` event

  console.log(name)
  // => "world"
  console.log(foo)
  // => "bar"

  next()
})

router.start()

router.navigate('/hello/world', {
  state: { foo: 'bar' }
})
```

## API

### Router

`new Router([base][, callback])`

`base` (String) should be set in case you're not operating at the root path `/` of the domain. The optional `callback` is fired after all callbacks of every matched route have been called. It should follow this signature `function (err, obj) {}`.

### \#add

`router.add(path[, callback ...])`

You can add as many callbacks as you need. This is internally handled by the [`ware`](https://www.npmjs.org/package/ware) module, so the callback signature should be the following:

`function (obj, next) {}`

Remember to call `next` when you're done so the next callback in line can be fired.

Routes are matched in the order they were `add`ed, and they are matched using the famous [`path-to-regexp`](https://www.npmjs.org/package/path-to-regexp) module, used by Express among many others, so regular expressions are supported and all that.

Please check out the `path-to-regexp` [documentation](https://github.com/pillarjs/path-to-regexp#parameters) to know more about route options.

Also checkout the [live demo](http://forbeslindesay.github.io/express-route-tester/) (pretty useful)!

### \#route

`add` alias.

### \#start

`router.start([trigger])`

Router starts listening for `popstate` events. Pass `false` to avoid a first run plus a `replaceState` call.

### \#navigate

`router.navigate(path[, options])`

`path` should be a string, starting with a slash (always).

Options being:

- `state`: Object. The state you want to keep in History for that path.
- `trigger`: Boolean. Fire the callbacks bound to the path. (Default: true)
- `replace`: Boolean. Call `replaceState` instead of `pushState` on `history`. (Default: false).
- `title`: String. Browser's document title, currently ignored by most browsers, see [MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#The_pushState%28%29.C2.A0method).

This will update the browser's URL with the new path by calling `window.history.pushState` with the state object you pass in.

### \#stop

`router.stop()`

Stop listening for `popstate` events.

## License

MIT
