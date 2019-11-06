export function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}

export function nodelistToArray(nl) {
  var l = []; 
  for(var i = 0, ll = nl.length; i != ll; l.push(nl[i++]));
  return l;
}

export function nodelistMap(nl, consumer) {
  for (var i = 0, len = nl.length; i < len; i++) {
    const node = nl[i];
    consumer(node);
  }
}

export function conditionalClasses(element, klasses) {
  let className = '';
  const keys = Object.keys(klasses);
  for (var i = 0, len = keys.length; i < len; i++) {
    if(klasses[keys[i]]) {
      className += `${keys[i]} `;
    }
  }

  element.className = className;
}

export function conditionalClassList(element, klasses) {
  const keys = Object.keys(klasses);
  for (var i = 0, len = keys.length; i < len; i++) {
    if(klasses[keys[i]]) {
      element.classList.add(keys[i]);
    } else {
      element.classList.remove(keys[i]);
    }
  }
}

export function splitHashPath() {
  let hash = window.location.hash;
  hash = hash.substr(2);

  const parts = hash.split('/');
  if(parts.length > 1) {
    parts.shift();
  }

  return {
    first: parts[0],
    pathname: hash,
    parts
  };
}

export function lookup(obj, ...path) {
  return path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj); 
}

export async function sha256(message) {
  const msgBuffer = new TextEncoder('utf-8').encode(message);                    
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}

function _getRefs(ctx, el, refs) {
  for (var i = 0, len = refs.length; i < len; i++) {
    var ref = refs[i];
    var element = qel(`.__${ref}`, el);
    if(element) {
      ctx[ref] = element;
    } else {
      console.warn('reference:', ref, 'not found from', el);
    }
  }
}

export function refs(ctx, refs, parent) {
  _getRefs(ctx, parent || ctx.el, refs);
}

export function qel(query, parent) {
  if(!parent) parent = document;
  return parent.querySelector(query);
}

export function qall(query, parent) {
  if(!parent) parent = document;
  return parent.querySelectorAll(query); 
}

export function createNode(id) {
  const tpl = document.getElementById(id);
  const node = document.importNode(tpl.content, true);
  return node;
}

