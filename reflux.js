export function dispatch(el, eventName, payload, options) {
  options || (options = {});
  el || (el = document);
  el = el.el || el;

  const event = document.createEvent('Event');
  event.initEvent(eventName, options.bubbles !== false, true);
  event.detail = payload || {};
  el.dispatchEvent(event);
}

export function listen(el, eventName, callback) {
  el || (el = document);
  el = el.el || el;
  el.addEventListener(eventName, callback);
  return callback; 
}

export function unlisten(el, eventName, func) {
  el || (el = document);
  el = el.el || el;
  el.removeEventListener(eventName, func);
}

export function dispatchAction(actionName, payload, el) {
  el || (el = document);
  const action = {
    action: actionName,
    payload: payload || {}
  };

  requestAnimationFrame(() => {
    dispatch(el, 'action', action);
  });
}

export function dispatcher(handler) {
  listen(document, 'action', e => {
    const action = e.detail.action;
    const payload = e.detail.payload || {};
    handler.call(this, action, Object.assign({}, payload));
    e.stopPropagation();
    return false;
  });
}

export function storeFactory(obj) {
  const element = document.createElement('div');
  element.setAttribute('data-store', true);

  const store = obj || {};
  store._element = element;
  store._listeners = {};

  store.listen = store.on = (name, callback) => {
    element.addEventListener(name, e => {
      callback(e, e.details);
    });

    store._listeners[name] || (store._listeners[name] = []);
    store._listeners[name].push(callback);
    return callback;
  };

  store.unlisten = (name, callback) => {
    const listeners = store._listeners[name];

    for (var len = listeners.length, i = len; i > 0; i--) {
      if(listeners[i] === callback) {
        element.removeEventListener(name, listeners[i]);
        listeners.splice(i, 1);
      }
    }
  };

  store.unlistenAll = (name) => {
    const listeners = store._listeners[name];

    let listener;
    while((listener = listeners.pop())) {
      element.removeEventListener(name, listener);
    }
  };

  store.dispatch = (name, details) => {
    dispatch(element, name, details);
  };

  if(store.initialize && typeof store.initialize == 'function') {
    store.initialize.call(store);
    store._initialized = true;
  }

  return store;
}

class HandlerRegistry {
  constructor() {
    this._handlers = {};
  }

  register(handlerMap) {
    const actions = Object.keys(handlerMap);
    for (var i = 0, len = actions.length; i < len; i++) {
      if(this._handlers[actions[i]]) {
        console.warn('[Reflux] duplicate handler', actions[i]);
      }
      this._handlers[actions[i]] = handlerMap[actions[i]];
    }
    return this;
  }

  add(action, callback) {
    this._handlers[action] = callback;
    return this;
  }

  handleAsync(action, payload, context) {
    const handler = this._handlers[action];
    if(handler) {
      return handler.call(this, payload, context);
    }
    return Promise.resolve();
  }

  handle(action, payload, context) {
    const handler = this._handlers[action];
    if(handler) {
      handler.call(this, payload, context);
    }
    return !!handler;
  }
}

export const handlers = new HandlerRegistry();

