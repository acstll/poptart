var test = require('tape');

var Router = require('./');
var router = new Router();



// TODO: proper tests that make sense
// https://github.com/visionmedia/page.js/blob/master/test/tests.js

test('starting', function (t) {
  t.plan(2);

  function cb1 (obj, next) {
    t.ok(obj, 'cb1 called');
    next();
  }
  function cb2 (obj, next) {
    t.ok(obj, 'cb2 called');
    next();
  }

  router.add('/', cb1, cb2);
  router.start();
});

test('starting 2', function (t) {
  t.plan(8);

  function cb1 (obj, next) {
    t.ok(obj, 'cb1 called');
    t.equal(obj.params.name, 'roger', 'params ok 1');
    t.equal(obj.params.id, '123', 'params ok 2');
    console.log('EVENT', obj.event);
    next();
  }
  function cb2 (obj, next) {
    t.ok(obj, 'cb2 called');
    t.ok(obj.event, 'event object there');
    t.equal(obj.state.a, 1, 'state there');
    next();
  }

  router.add('/foo/:name/:id', cb1, cb2);

  router.once('match', function (path) {
    t.equal(path, '/foo/roger/123', 'match event emitted');
  });

  setTimeout(function () {
    router.navigate('/foo/roger/123', { a: 1 }, { trigger: true });
  }, 1000);

  t.ok(router.routes[0].keys, 'this.keys ok');
});

test('navigate method signature', function (t) {
  t.plan(2);

  var noop = function (obj, next) {
    t.ok(obj, 'called once');
    next();
  };

  router.add('/bar/:id', noop);
  router.add('*', function (obj, next) {
    t.ok(obj, 'called from * route');
    next();
  });

  setTimeout(function () {
    router.navigate('/bar/1');
    setTimeout(function () {
      router.navigate('/bar/2', true);
      setTimeout(function () {
        router.navigate('/bar/3', { beep: 'boop' });
      }, 500);
    }, 500);
  }, 1500);
});

/*
router.navigate('/bar/3', {}, { trigger: false })
  === router.navigate('/bar/3')
  === router.navigate('/bar/3', {})

router.navigate('/bar/3', true)
  === router.navigate('/bar/3', {}, true)
  === router.navigate('/bar/3', {}, { trigger: true })

router.navigate('/bar/3', { replace: true }) === FAIL!
*/