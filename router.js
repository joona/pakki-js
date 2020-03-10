export const router = {
  routes: [],
  root: '/',
  mode: 'hash',
  factories: {},

  config(options) {
    this.mode = options && options.mode && options.mode == 'history' 
      && !!(history.pushState) ? 'history' : 'hash';
    this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
    return this;
  },

  getFragment() {
    var fragment = '';

    if(this.mode === 'history') {
      fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
      fragment = fragment.replace(/\\?(.*)$/, '');
      fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
    } else {
      var match = window.location.href.match(/#(.*)$/);
      fragment = match ? match[1] : '';
    }
    return this.clearSlashes(fragment);
  },

  clearSlashes(path) {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
  },

  add(re, handler, maybeCondition) {
    if(typeof re == 'function') {
      handler = re;
      re = '';
    }

    if(typeof maybeCondition !== 'function') {
      maybeCondition = null;
    }

    this.routes.push({ re: re, handler: handler, condition: maybeCondition });
    return this;
  },

  remove(param) {
    for(var i=0, r; i < this.routes.length, r = this.routes[i]; i++) {
      if(r.handler === param || r.re.toString() === param.toString()) {
        this.routes.splice(i, 1); 
        return this;
      }
    }
    return this;
  },

  flush() {
    this.routes = [];
    this.mode = null;
    this.root = '/';
    return this;
  },

  check(f) {
    var fragment = f || this.getFragment();
    for(var i=0; i < this.routes.length; i++) {
      console.log('route re', this.routes[i].re);
      var match = fragment.match(this.routes[i].re);
      if(match) {
        console.log('match');
        match.shift();

        if(this.routes[i].condition) {
          const rval = this.routes[i].condition();
          if(rval !== true) {
            console.log('Route match, but precondition not truthy:', this.routes[i]);
            continue;
          }
        }
        this.routes[i].handler.apply({}, match);
        return this;
      }           
    }

    return this;
  },

  listen() {
    var self = this;
    var current = self.getFragment();
    var fn = function() {
      if(current !== self.getFragment()) {
        current = self.getFragment();
        self.check(current);
      }
    }
    clearInterval(this.interval);
    this.interval = setInterval(fn, 50);
    return this;
  },

  getFactory(factoryName) {
    return (...args) => {
      const parts = this.factories[factoryName](...args);
      const pathName = parts.join('/');
      if(pathName.charAt(0) !== '/') {
        let root = this.root;

        if(this.root.charAt(this.root.length - 1) != '/') {
          root += '/';
        }

        return root + pathName;
      }
    }

    return pathName; 
  },

  goto(factoryName, ...args) {
    const path = this.getFactory(factoryName)(...args);
    this.navigate(path);
  },

  navigate(path) {
    path = path ? path : '';
    if(this.mode === 'history') {
      history.pushState(null, null, this.root + this.clearSlashes(path));
    } else {
      window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
    }
    return this;
  }
}

