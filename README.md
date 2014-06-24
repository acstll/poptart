# Poptart

Yet another JavaScript client-side router.

## Install

With [npm](http://npmjs.org) do:

```bash
npm install poptart
```

## Stability

Documentation is incomplete, and API should be considered unstable.

## Browser support

Modern browsers plus IE10 and up.   
See [Can I use](http://caniuse.com/#search=history) for the `history` API.
(Proper testing is on the todo list.)

## Usage

```js
var Router = require('poptart');

var router = new Router();

router.add('/hello/:name', function (obj) {
  var name = obj.params.name; // Url params
  var foo = obj.state.foo; // Your state object
  var event = obj.event; // Original `popstate` event

  console.log(name, foo);
  // => "foo", "bar"
  // ...
});

router.start();

router.navigate('/hello/foo', { foo: 'bar' }, true);
```

## API

### Router

`new Router([base], [callback])`

`base` (String) should be set in case you're not operating at the root path `/` of the domain. The optional `callback` is fired after all callbacks of every matched route have been called. It should follow this signature `function (err, obj) {}`.

### \#add

`router.add(path, callback, [callback ...])`

You can add as many callbacks as you need. This is internally handled by the [`ware`](https://www.npmjs.org/package/ware) module, so the callback signature should be the following:

`function (obj, next) {}`

Remember to call `next` when you're done so the next callback in line can be fired.

Routes are matched in the order they were `add`ed, and they are matched using the famous [`path-to-regexp`](https://www.npmjs.org/package/path-to-regexp) module, used by Express among many others, so regular expressions are supported and all that.

### \#route 

`add` alias.

### \#start

`router.start()`

Router starts listening for `popstate` events.

### \#navigate

`router.navigate(path, [state], [options])`

Options being:

- `trigger`: Boolean. Fire the callbacks bound to the path.
- `replace`: Boolean. Call `replaceState` instead of `pushState` on `history`.
- `title`: String. Browser's document title, currently ignored by must browsers, see [MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#The_pushState%28%29.C2.A0method).

This will update the browser's URL with the new path by calling `window.history.pushState` with the state object you pass in. If you want to fire the callbacks bound to the route add `{ trigger: true }` to the `options` object.

If you don't need to pass a state object and you want to trigger the callbacks, you can use `router.navigate(path, true)`. But keep in mind the `options` object should always be the third argument. This won't work: `router.navigate(path, { replace: true })`, but this will: `router.navigate(path, {}, { replace: true })`.

### \#stop

`router.stop()`

## License

MIT
