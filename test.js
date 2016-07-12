
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

  router.add('/', cb1, cb2, cb3)

  router.start()

  router.stop()

  router.push('/stop')
})

test('`history` reference', function (t) {
  t.plan(1)

  var router = createRouter(history)

  t.equal(router.history, history, 'is there')
})

test('Push and generate', function (t) {
  t.plan(3)

  var router = createRouter(history)
  var __location

  var off = history.listen(function (l) { __location = l })

  router.add('/foo/:id')
  router.add('/baz')

  router.start()

  t.throws(function () {
    router.generate('/foo/:id')
  }, '`generate` throws if called without params when needed')

  /*t.throws(function () {
    router.push('/666')
  }, '`push` throws if route doesn’t exist')*/

  router.push(router.generate('/foo/:id', { id: 1 }))
  t.equal(__location.pathname, '/foo/1', 'work with params')

  router.push('/baz')
  t.equal(__location.pathname, '/baz', 'work without params')

  router.stop()
  off()
})

test('Route, current', function (t) {
  t.plan(3)

  var router = createRouter(history)

  router.add('/foo')
  router.add('/bar')

  router.start()

  router.push('/foo')
  t.equal(router.current.path, '/foo', '`current` works')

  router.push('/bar')
  t.equal(router.current.path, '/bar', 'for real')
  t.equal(typeof router.current.generate, 'function', 'and has `generate` fn')

  router.stop()
})

test('Base, other than /', function (t) {
  t.plan(2)

  var router = createRouter(history, '/api')

  router.add('/', function (location, next) {
    t.pass('home..')
    next()
  })
  router.add('/resource/:id', function (location, next) {
    t.equal(location.pathname, '/api/resource/123', 'works correctly')
  })

  router.start()

  router.push('/')
  router.push(router.generate('/resource/:id', { id: 123 }))

  router.stop()
})

test('replace', function (t) {
  t.plan(1)

  var router = createRouter(history)

  router.add('/beep', function (location, next) {
    t.equal(location.action, 'REPLACE', 'works')
    next()
  })

  router.start()

  router.replace('/beep')

  router.stop()
})

test('Params, location and state', function (t) {
  t.plan(10)

  var router = createRouter(history)

  router.add('/:slug/filter/:filter/tag/:tag', function (location, next) {
    t.equal(typeof location.params, 'object', 'params is object')
    t.equal(Object.keys(location.params).length, 3, 'has proper keys')
    t.equal(location.params.slug, 'yep')
    t.equal(location.params.filter, 'foo')
    t.equal(location.params.tag, 'bar', '..and values')
    t.equal(location.state.a, 1, 'state is there and is correct')
    t.equal(location.__path, '/:slug/filter/:filter/tag/:tag', '`__path` is there')
    t.equal(typeof location.generate, 'function', '..and `generarte`')
    next()
  })

  router.add('/no-state', function (location) {
    t.equal(typeof location.state, 'undefined', 'state is undefined when missing')
  })

  router.add('/no-param/:num?', function (location, next) {
    t.notEqual(typeof location.params.num, 'string', 'optional undefined params are undefined and no strings')
  })

  router.start()

  router.push({
    pathname: router.generate('/:slug/filter/:filter/tag/:tag', {
      slug: 'yep',
      filter: 'foo',
      tag: 'bar'
    }), 
    state: { a: 1 }
  })
  router.push('/no-state')
  router.push('/no-param')

  router.stop()
})

test('* for not found', function (t) {
  t.plan(4)

  var router = createRouter(history)

  router.add('/1', function () { t.pass() })
  router.add('/2', function () { t.pass() })
  router.add('/3', function () { t.pass() })
  router.add('*', function () {
    t.pass('not found matched just once')
  })

  history.replace('/3')

  router.start()

  router.push('/two')
  router.push('/one')

  history.push('/done')

  router.stop()
})
