
var test = require('tape')
var historyType = process.argv[2] === '--browser' ? 'createBrowserHistory' : 'createMemoryHistory'
var createHistory = require('history')[historyType]

var createRouter = require('./')
var history = createHistory()

test('Callbacks, start and stop', function (t) {
  t.plan(4)

  var router = createRouter(history, null, function final (err, obj) {
    if (err) {
      t.skip()
    }
    t.pass('final callback fired')
  })

  function cb1 (obj, next) {
    t.pass('first callback fired')
    next()
  }
  function cb2 (obj, next) {
    t.pass('second callback fired')
    next()
  }
  function cb3 (obj, next) {
    t.pass('third callback fired')
    next()
  }

  router.add('home', '/', cb1, cb2, cb3)

  router.start()

  router.stop()

  router.history.pushState('/stop')
})

test('`history` reference', function (t) {
  t.plan(1)

  var router = createRouter(history)

  t.equal(router.history, history, 'is there')
})

test('Navigate', function (t) {
  t.plan(4)

  var router = createRouter(history)
  var __location

  var off = history.listen(function (l) { __location = l })

  router.add('foo', '/foo/:id')
  router.add('baz', '/baz')

  router.start()

  t.throws(function () {
    router.navigate('foo')
  }, 'throws if called without params when needed')

  t.throws(function () {
    router.navigate('666')
  }, 'throws if route doesn’t exist')

  router.navigate('foo', { id: 1 })
  t.equal(__location.pathname, '/foo/1', 'works with params')

  router.navigate('baz')
  t.equal(__location.pathname, '/baz', 'works without params')

  router.stop()
  off()
})

test('Route, current', function (t) {
  t.plan(3)

  var router = createRouter(history)

  router.add('foo', '/foo')
  router.add('bar', '/bar')

  router.start()

  router.navigate('foo')
  t.equal(router.current.name, 'foo', '`current` works')

  router.navigate('bar')
  t.equal(router.current.name, 'bar', 'for real')
  t.equal(typeof router.current.generate, 'function', 'and has `generate` fn')

  router.stop()
})

test('Base, other than /', function (t) {
  t.plan(2)

  var router = createRouter(history, '/api')

  router.add('home', '/', function (obj, next) {
    t.pass('home..')
    next()
  })
  router.add('resource', '/resource/:id', function (obj, next) {
    t.equal(obj.location.pathname, '/api/resource/123', 'works correctly')
  })

  router.start()

  router.navigate('home')
  router.navigate('resource', { id: 123 })

  router.stop()
})

test('replaceState', function (t) {
  t.plan(1)

  var router = createRouter(history)

  router.add('replace', '/beep', function (obj, next) {
    t.equal(obj.location.action, 'REPLACE', 'works')
    next()
  })

  router.start()

  router.navigate('replace', null, { replace: true })

  router.stop()
})

test('Params, location and state', function (t) {
  t.plan(12)

  var router = createRouter(history)

  router.add('params', '/:slug/filter/:filter/tag/:tag', function (obj, next) {
    t.ok(Array.isArray(obj.params), 'params is array')
    t.equal(Object.keys(obj.params).length, 3, 'has proper keys')
    t.equal(obj.params.slug, 'yep')
    t.equal(obj.params.filter, 'foo')
    t.equal(obj.params.tag, 'bar', '..and values')
    t.equal(typeof obj.location, 'object', '`location` is there')
    t.equal(obj.location.state.a, 1, 'and is correct')
    t.equal(Object.keys(obj.route).length, 3, '`route` has proper keys')
    t.equal(obj.route.name, 'params')
    t.equal(obj.route.path, '/:slug/filter/:filter/tag/:tag')
    t.equal(typeof obj.route.generate, 'function', '..and values')
    next()
  })

  router.add('noState', '/no-state', function (obj) {
    t.equal(typeof obj.location.state, 'object', 'state is empty object when missing')
  })

  router.start()

  router.navigate('params', {
    slug: 'yep',
    filter: 'foo',
    tag: 'bar'
  }, { state: { a: 1 }})

  router.navigate('noState')

  router.stop()
})

test('* for not found', function (t) {
  t.plan(4)

  var router = createRouter(history)

  router.add('one', '/1', function () { t.pass() })
  router.add('two', '/2', function () { t.pass() })
  router.add('three', '/3', function () { t.pass() })
  router.add('notFound', '*', function () {
    t.pass('not found matched just once')
  })

  history.replaceState(null, '/3')

  router.start()

  router.navigate('two')
  router.navigate('one')

  history.pushState(null, '/done')

  router.stop()
})
