var test = require('tape')

var Router = require('./')
var router

var DURATION = 50

function defer (fn) {
  DURATION += DURATION
  return setTimeout(fn, DURATION)
}

test('callbacks, start', function (t) {
  t.plan(4)

  router = new Router(null, function (err, obj) {
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

  router.callback = null
})

test('navigate', function (t) {
  t.plan(6)

  var state = { a: 1 }

  function cb1 (obj, next) {
    t.ok(Array.isArray(obj.params), '`params` passed and is array')
    t.equal(obj.params.name, 'bar', 'params values are ok (1)')
    t.equal(obj.params.id, '1', 'params values ok are (2)')
    next()
  }
  function cb2 (obj, next) {
    t.ok(obj.event, 'event object is there')
    t.equal(obj.state, state, 'passed in state is there and ok')
    next()
  }

  router.add('/foo/:name/:id', cb1, cb2)

  defer(function () {
    router.navigate('/foo/bar/1', { state: state })

    t.equal(window.location.pathname, '/foo/bar/1', 'pathname on windows got set')
  })
})

test('popstate event object', function (t) {
  t.plan(2)

  router.routes.shift()

  router.add('/', function (obj, next) {
    t.equal(obj.event.type, 'popstate', 'passed in correctly')
    next()
  })

  defer(function () {
    window.history.back()
  })

  router.add('/foo', function (obj, next) {
    t.equal(obj.event.type, undefined, 'faux-popstate event object passed in too')
    next()
  })

  defer(function () {
    router.navigate('/foo')
  })
})

test('{ trigger: false }, start(false)', function (t) {
  t.plan(1)

  function cb () {
    t.skip('won’t trigger')
  }

  router.add('/ok', cb)
  router.navigate('/ok', { trigger: false })
  router.stop()
  router.start(false)
  cb()
})

test('* as not found', function (t) {
  t.plan(2)

  router.add('/found', function () {
    t.pass('not triggered when something matched')
  })
  router.add('*', function () {
    t.pass('triggered otherwise')
  })

  defer(function () {
    router.navigate('/found')
  })
  defer(function () {
    router.navigate('/not-found')
  })
})
