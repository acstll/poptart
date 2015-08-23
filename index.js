
var ware = require('ware')
var pathToExp = require('path-to-regexp')
var extend = require('xtend')
// var omit = require('lodash.omit')

/*
  TODO
  - Check route name (or path?) exists to avoid duplicates
  - Improve params if possible
    https://www.npmjs.com/package/path-to-regexp#suffixed-parameters
*/

module.exports = function router (history, base, callback) {
  base = base || ''
  callback = callback || function () {}
  var routes = []
  var stopListening
  var currentIndex

  function start () {
    stopListening = history.listen(run)
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

  function navigate (name, params, options) {
    options = extend({
      replace: false,
      state: {}
    }, options)

    var action = options.replace ? 'replaceState' : 'pushState'
    var route = findByName(routes, name)
    var path

    if (!route) {
      throw Error('No route found with name ' + name)
    }

    path = base + route.generate(params)
    history[action](options.state, path)
  }

  function add (name, path) {
    var callbacks = [].slice.call(arguments, 2)
    routes.push(routeFactory(name, path, callbacks))

    return this
  }

  return {
    start: start,
    stop: stop,
    add: add,
    route: add,
    navigate: navigate,
    get current () {
      return routes[currentIndex]
    },
    history: history
  }
}

function match (route, base, location, callback) {
  var obj = {}
  var params = obj.params = []
  var done = typeof callback === 'function' ? callback : null
  var pathname = location.pathname

  if (pathname.indexOf(base) > -1) {
    pathname = pathname.slice(base.length)
  }

  var result = route.re.exec(pathname)

  if (!result) return false

  var key, value, len, i
  for (i = 1, len = result.length; i < len; ++i) {
    key = route.keys[i - 1]
    value = decodeURIComponent(result[i])
    if (value !== undefined || !(hasOwnProperty.call(params, key.name))) {
      params[key.name] = value
    }
  }

  obj.location = location
  obj.route = {
    name: route.name,
    path: route.path,
    generate: route.generate
  }

  route.ware.run(obj, done)

  return true
}

function routeFactory (name, path, callbacks) {
  var route = {
    name: name,
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

function findByName (arr, name) {
  var i

  arr.some(function (item, index) {
    if (item.name === name) {
      i = index
      return true
    }
  })

  return arr[i]
}
