var ware = require('ware')
var pathToExp = require('path-to-regexp')
var extend = require('xtend')

// TODO
// try to implement pathToExp.compile()
// https://github.com/pillarjs/path-to-regexp#compile-reverse-path-to-regexp

module.exports = Router

function Router (base, callback) {
  var self = this
  if (typeof base === 'function') {
    callback = base
    base = ''
  }

  self.base = base || ''
  self.callback = callback
  self.routes = []
  self.onpopstate = self.run.bind(self)
}

Router.prototype.start = function (run) {
  var self = this

  window.addEventListener('popstate', self.onpopstate)

  if (run !== false) {
    self.navigate(self.onpopstate(), {
      replace: true,
      trigger: false
    })
  }
}

Router.prototype.route =
Router.prototype.add = function (path) {
  var self = this
  var callbacks = [].slice.call(arguments)
  callbacks.shift()

  if (path === '*') {
    path = /.*/
  }
  self.routes.push(new Route(path, callbacks))

  return self
}

Router.prototype.navigate = function (path, options) {
  var self = this

  options = extend({
    trigger: true,
    replace: false,
    title: null,
    state: {}
  }, options)

  path = this.base + path

  var title = options.title
  var action = options.replace ? 'replaceState' : 'pushState'

  window.history[action](options.state, title, path)

  if (options.trigger) {
    self.run({ state: options.state })
  }
}

Router.prototype.run = function (event) {
  event = event || {}
  var self = this
  var pathname = window.location.pathname
  var finalCallback = self.callback

  if (pathname.indexOf(self.base) > -1) {
    pathname = pathname.slice(self.base.length)
  }

  self.routes.forEach(function (route) {
    var path = pathname || '/'
    return route.match(path, event, finalCallback)
  })

  return pathname
}

Router.prototype.stop = function () {
  var self = this
  window.removeEventListener('popstate', self.onpopstate)
}

Router.Route = Route

function Route (path, callbacks) {
  var self = this
  var w = self.ware = ware()
  self.keys = []
  self.re = pathToExp(path, self.keys)

  callbacks.forEach(function (fn) {
    w.use(fn)
  })
}

Route.prototype.match = function (path, event, callback) {
  var self = this
  var key, value, len, i
  var obj = {}
  var params = obj.params = []
  obj.event = event || {}
  obj.state = obj.event.state

  var result = self.re.exec(path)

  if (!result) {
    return false
  }

  // https://github.com/visionmedia/page.js/blob/master/index.js#L495-L501
  for (i = 1, len = result.length; i < len; ++i) {
    key = self.keys[i - 1]
    value = window.decodeURIComponent(result[i])
    if (value !== undefined || !(hasOwnProperty.call(params, key.name))) {
      params[key.name] = value
    }
  }

  if (typeof callback === 'function') {
    this.ware.run(obj, callback)
  } else {
    this.ware.run(obj)
  }

  return true
}
