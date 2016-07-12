
var ware = require('ware')
var pathToExp = require('path-to-regexp')
var extend = require('xtend')

/*
  TODO
  - Accept path-to-regexp options (use options object in factory?)
  - Check route path exists to avoid duplicates
  - Improve params if possible
    https://www.npmjs.com/package/path-to-regexp#suffixed-parameters
*/

module.exports = function router (history, base, callback) {
  base = base || ''
  callback = callback || function () {}
  var routes = []
  var stopListening
  var currentIndex

  function start (immediately) {
    stopListening = history.listen(run)
    if (immediately !== false) {
      run(history.getCurrentLocation())
    }

    return this
  }

  function stop () {
    stopListening()
  }

  function run (location) {
    routes.some(function (route, index) {
      var matched = match(route, base, location, callback)
      if (matched) {
        currentIndex = index
        return true
      }
    })
  }

  function navigate (action, location) {
    if (typeof location === 'string') {
      location = base + location
    } else if (typeof location !== 'undefined') {
      location.pathname = base + location.pathname
    }

    return history[action](location)
  }

  function generate (path, params) {
    var route = findByPath(routes, path)

    if (!route) {
      throw Error('No route found for path ' + path)
    }

    return route.generate(params)
  }

  function add (path) {
    var callbacks = [].slice.call(arguments, 1)
    routes.push(routeFactory(path, callbacks))

    return this
  }

  var router = {
    start: start,
    stop: stop,
    history: history,
    add: add,
    route: add,
    generate: generate,
    push: navigate.bind(null, 'push'),
    replace: navigate.bind(null, 'replace')
  }

  return Object.defineProperty(router, 'current', {
    get: function () {
      return routes[currentIndex]
    }
  })
}

function match (route, base, location, callback) {
  var pathname = location.pathname
  var done = typeof callback === 'function' ? callback : null
  var keys = route.keys
  var params = {}
  var result

  if (pathname.indexOf(base) > -1) {
    pathname = pathname.slice(base.length)
  }

  result = route.re.exec(pathname)

  if (!result) {
    return false
  }

  var key, value, len, i
  for (i = 1, len = result.length; i < len; ++i) {
    key = keys[i - 1]
    value = typeof result[i] === 'string' ? decodeURIComponent(result[i]) : result[i]
    if (key) {
      params[key.name] = value
    }
  }

  route.ware.run(extend({
    params: params,
    generate: route.generate,
    __path: route.path
  }, location), done)

  return true
}

function routeFactory (path, callbacks) {
  var route = {
    keys: [],
    path: path,
    re: null,
    generate: pathToExp.compile(path),
    ware: ware()
  }

  callbacks.forEach(route.ware.use.bind(route.ware))
  route.re = pathToExp(path, route.keys)

  return route
}

function findByPath (arr, path) {
  var i

  arr.some(function (item, index) {
    if (item.path === path) {
      i = index
      return true
    }
  })

  return arr[i]
}
