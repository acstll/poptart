var ware = require('ware');
var pathToExp = require('path-to-regexp');
var EventEmitter = require('eventemitter3').EventEmitter;



module.exports = Router;

function Router (base, callback) {
  if (typeof base === 'function') {
    callback = base;
    base = '';
  }

  this.base = base || '';
  this.callback = callback;
  this.routes = [];
  this.onpopstate = this.run.bind(this);

  EventEmitter.call(this);
}

Router.prototype = Object.create(EventEmitter.prototype);

Router.prototype.start = function (run) {
  window.addEventListener('popstate', this.onpopstate);
  if (run !== false) {
    this.navigate(this.onpopstate(), null, { replace: true });
  }
  this.emit('start');
};

Router.prototype.route =
Router.prototype.add = function (path) {
  var callbacks = [].slice.call(arguments);
  callbacks.shift();

  if (path === '*') path = /.*/;
  
  this.routes.push(new Route(path, callbacks));
  return this;
};

Router.prototype.navigate = function (path, state, options) {
  if (typeof state === 'boolean') {
    options = { trigger: !!state };
    state = {};
  } else if (!options || typeof options === 'boolean') {
    options = {
      trigger: !!options,
      replace: false
    };
  }

  path = this.base + path;

  var title = options.title || null;
  var action = options.replace ? 'replaceState' : 'pushState';

  window.history[action](state, title, path);
  if (options.trigger) this.run({ state: state });
};

Router.prototype.run = function (event) {
  if (!event) event = {};
  var pathname = window.location.pathname;
  var callback = this.callback;

  if (pathname.indexOf(this.base) > -1) {
    pathname = pathname.slice(this.base.length);
  }
    
  this.routes.forEach(function (route) {
    var path = pathname || '/';
    var match = route.match(path, event, callback);

    if (match !== false) this.emit('match', path);
  }.bind(this));

  return pathname;
};

Router.prototype.stop = function () {
  window.removeEventListener('popstate', this.onpopstate);
};

Router.Route = Route;

function Route (path, callbacks) {
  this.keys = []
  this.re = pathToExp(path, this.keys);
  var _ware = this.ware = ware();

  callbacks.forEach(function (fn) {
    _ware.use(fn);
  });
}

Route.prototype.match = function(path, event, callback) {
  var key, value, len, i;
  var obj = {};
  obj.params = [];
  obj.event = event || {};
  obj.state = obj.event.state;

  var result = this.re.exec(path);

  if (!result) return false;

  for (i = 1, len = result.length; i < len; i++) {
    var key = this.keys[i - 1];
    var value = typeof result[i] == 'string'
        ? window.decodeURI(result[i])
        : result[i];

    if (key) {
      obj.params[key.name] = obj.params[key.name] !== undefined
        ? obj.params[key.name]
        : value;
    } else {
      obj.params.push(value);
    }
  }

  if (typeof callback === 'function') {
    this.ware.run(obj, callback);
  } else {
    this.ware.run(obj);
  }
};
