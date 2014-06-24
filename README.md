# Poptart

Yet another JavaScript client-side router.

## Install

With [npm](http://npmjs.org) do:

```bash
npm install poptart
```

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

### \#add

`router.add(path, callback, […callback])`

You can add as many callbacks as you need. This is internally handled by the [`ware`](https://www.npmjs.org/package/ware) module.
Routes are matched in the ordered they were `add`ed, and they are matched using the famous [`path-to-regexp`](https://www.npmjs.org/package/path-to-regexp) module, used by Express among many others.

### \#route 

`add` alias

### \#start

`router.start()`

Router starts listening for `popstate` events.

### \#navigate

`router.navigate(path, [state], [options])`

Options being:

- `trigger`: Boolean. Fire the callbacks bound to the path
- `replace`: Boolean. Call `replaceState` instead of `pushState` on `history`.

If you don't need to pass a state object and you want to trigger the callbacks, you can use `router.navigate(path, true)`. But keep in mind the `options` object should always be the third argument. This won't work: `router.navigate(path, { replace: true })`, but this will: `router.navigate(path, {}, { replace: true })`.

### \#stop

`router.stop()`

## License

MIT
