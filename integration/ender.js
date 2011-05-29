/*!
  * Ender: open module JavaScript framework
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * https://ender.no.de
  * License MIT
  * Build: ender build qwery bonzo domready
  */
!function (context) {

  function aug(o, o2) {
    for (var k in o2) {
      k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k]);
    }
    return o;
  }

  function boosh(s, r) {
    var els;
    if (ender._select && typeof s == 'string' || s.nodeName || s.length && 'item' in s || s == window) { //string || node || nodelist || window
      els = ender._select(s, r);
      els.selector = s;
    } else {
      els = isFinite(s.length) ? s : [s];
    }
    return aug(els, boosh);
  }

  function ender(s, r) {
    return boosh(s, r);
  }

  aug(ender, {
    _VERSION: '0.2.0',
    ender: function (o, chain) {
      aug(chain ? boosh : ender, o);
    }
  });

  aug(boosh, {
    forEach: function (fn, scope) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item
      for (var i = 0, l = this.length; i < l; ++i) {
        i in this && fn.call(scope || this[i], this[i], i, this);
      }
      // return self for chaining
      return this;
    }
  });

  var old = context.$;
  ender.noConflict = function () {
    context.$ = old;
    return this;
  };

  (typeof module !== 'undefined') && module.exports && (module.exports = ender);
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = ender;

}(this);
/*!
  * qwery.js - copyright @dedfat
  * https://github.com/ded/qwery
  * Follow our software http://twitter.com/dedfat
  * MIT License
  */

!function (context, doc) {

  var c, i, j, k, l, m, o, p, r, v,
      el, node, len, found, classes, item, items, token,
      id = /#([\w\-]+)/,
      clas = /\.[\w\-]+/g,
      idOnly = /^#([\w\-]+$)/,
      classOnly = /^\.([\w\-]+)$/,
      tagOnly = /^([\w\-]+)$/,
      tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/,
      html = doc.documentElement,
      tokenizr = /\s(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\])/,
      specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g,
      simple = /^([a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
      attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,
      chunker = new RegExp(simple.source + '(' + attr.source + ')?');

  function array(ar) {
    r = [];
    for (i = 0, len = ar.length; i < len; i++) {
      r[i] = ar[i];
    }
    return r;
  }

  var cache = function () {
    this.c = {};
  };
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined;
    },
    s: function (k, v) {
      this.c[k] = v;
      return v;
    }
  };

  var classCache = new cache(),
      cleanCache = new cache(),
      attrCache = new cache(),
      tokenCache = new cache();

  function q(query) {
    return query.match(chunker);
  }

  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value) {
    var m, c, k;
    if (tag && this.tagName.toLowerCase() !== tag) {
      return false;
    }
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) {
      return false;
    }
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) {
        c = classes[i].slice(1);
        if (!(classCache.g(c) || classCache.s(c, new RegExp('(^|\\s+)' + c + '(\\s+|$)'))).test(this.className)) {
          return false;
        }
      }
    }
    if (wholeAttribute && !value) {
      o = this.attributes;
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this;
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, this.getAttribute(attribute) || '', value)) {
      return false;
    }
    return this;
  }

  function loopAll(tokens) {
    var r = [], token = tokens.pop(), intr = q(token), tag = intr[1] || '*', i, l, els,
        root = tokens.length && (m = tokens[0].match(idOnly)) ? doc.getElementById(m[1]) : doc;
    if (!root) {
      return r;
    }
    els = root.getElementsByTagName(tag);
    for (i = 0, l = els.length; i < l; i++) {
      el = els[i];
      if (item = interpret.apply(el, intr)) {
        r.push(item);
      }
    }
    return r;
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'));
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val;
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, new RegExp('^' + clean(val))));
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, new RegExp(clean(val) + '$')));
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, new RegExp(clean(val))));
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, new RegExp('(?:^|\\s+)' + clean(val) + '(?:\\s+|$)')));
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, new RegExp('^' + clean(val) + '(-|$)')));
    }
    return false;
  }

  function _qwery(selector) {
    var r = [], ret = [], i, l,
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
    tokens = tokens.slice(0);
    if (!tokens.length) {
      return r;
    }
    r = loopAll(tokens);
    if (!tokens.length) {
      return r;
    }
    // loop through all descendent tokens
    for (j = 0, l = r.length, k = 0; j < l; j++) {
      node = r[j];
      p = node;
      // loop through each token
      for (i = tokens.length; i--;) {
        z: // loop through parent nodes
        while (p !== html && (p = p.parentNode)) {
          if (found = interpret.apply(p, q(tokens[i]))) {
            break z;
          }
        }
      }
      found && (ret[k++] = node);
    }
    return ret;
  }

  function boilerPlate(selector, _root, fn) {
    var root = (typeof _root == 'string') ? fn(_root)[0] : (_root || doc);
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : [];
    }
    if (selector && typeof selector === 'object' && isFinite(selector.length)) {
      return array(selector);
    }
    if (m = selector.match(idOnly)) {
      return (el = doc.getElementById(m[1])) ? [el] : [];
    }
    if (m = selector.match(tagOnly)) {
      return array(root.getElementsByTagName(m[1]));
    }
    return false;
  }

  function isNode(el) {
    return (el && el.nodeType && (el.nodeType == 1 || el.nodeType == 9));
  }

  function uniq(ar) {
    var a = [], i, j;
    label:
    for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) {
          continue label;
        }
      }
      a[a.length] = ar[i];
    }
    return a;
  }

  function qwery(selector, _root) {
    var root = (typeof _root == 'string') ? qwery(_root)[0] : (_root || doc);
    if (!root || !selector) {
      return [];
    }
    if (m = boilerPlate(selector, _root, qwery)) {
      return m;
    }
    return select(selector, root);
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16;
    } : 'contains' in html ?
    function (element, container) {
      container = container == doc || container == window ? html : container;
      return container !== element && container.contains(element);
    } :
    function (element, container) {
      while (element = element.parentNode) {
        if (element === container) {
          return 1;
        }
      }
      return 0;
    },

  select = (doc.querySelector && doc.querySelectorAll) ?
    function (selector, root) {
      if (doc.getElementsByClassName && (m = selector.match(classOnly))) {
        return array((root).getElementsByClassName(m[1]));
      }
      return array((root).querySelectorAll(selector));
    } :
    function (selector, root) {
      var result = [], collection, collections = [], i;
      if (m = selector.match(tagAndOrClass)) {
        items = root.getElementsByTagName(m[1] || '*');
        r = classCache.g(m[2]) || classCache.s(m[2], new RegExp('(^|\\s+)' + m[2] + '(\\s+|$)'));
        for (i = 0, l = items.length, j = 0; i < l; i++) {
          r.test(items[i].className) && (result[j++] = items[i]);
        }
        return result;
      }
      for (i = 0, items = selector.split(','), l = items.length; i < l; i++) {
        collections[i] = _qwery(items[i]);
      }
      for (i = 0, l = collections.length; i < l && (collection = collections[i]); i++) {
        var ret = collection;
        if (root !== doc) {
          ret = [];
          for (j = 0, m = collection.length; j < m && (element = collection[j]); j++) {
            // make sure element is a descendent of root
            isAncestor(element, root) && ret.push(element);
          }
        }
        result = result.concat(ret);
      }
      return uniq(result);
    };

  qwery.uniq = uniq;
  var oldQwery = context.qwery;
  qwery.noConflict = function () {
    context.qwery = oldQwery;
    return this;
  };
  context['qwery'] = qwery;

}(this, document);!function (doc) {
  var q = qwery.noConflict();
  function create(node, root) {
    var el = (root || doc).createElement('div'), els = [];
    el.innerHTML = node;
    var nodes = el.childNodes;
    el = el.firstChild;
    els.push(el);
    while (el = el.nextSibling) {
      (el.nodeType == 1) && els.push(el);
    }
    return els;
  };
  $._select = function (s, r) {
    return /^\s*</.test(s) ? create(s, r) : q(s, r);
  };
  $.ender({
    find: function (s) {
      var r = [], i, l, j, k, els;
      for (i = 0, l = this.length; i < l; i++) {
        els = q(s, this[i]);
        for (j = 0, k = els.length; j < k; j++) {
          r.push(els[j]);
        }
      }
      return $(q.uniq(r));
    }
    , and: function (s) {
      var plus = $(s);
      for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
        this[i] = plus[j];
      }
      return this;
    }
  }, true);
}(document);
/*!
  * bonzo.js - copyright @dedfat 2011
  * https://github.com/ded/bonzo
  * Follow our software http://twitter.com/dedfat
  * MIT License
  */
!function (context) {

  var doc = context.document,
      html = doc.documentElement,
      query = null,
      byTag = 'getElementsByTagName',
      specialAttributes = /^checked|value|selected$/,
      specialTags = /select|map|fieldset|table|tbody|tr|colgroup/i,
      tagMap = { select: 'option', table: 'tbody', tr: 'td' },
      stateAttributes = /^checked|selected$/,
      ie = /msie/i.test(navigator.userAgent),
      uidList = [],
      uuids = 0,
      digit = /^-?[\d\.]+$/,
      px = 'px',
      // commonly used methods
      setAttribute = 'setAttribute',
      getAttribute = 'getAttribute',
      trimReplace = /(^\s*|\s*$)/g,
      unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 };

  function classReg(c) {
    return new RegExp("(^|\\s+)" + c + "(\\s+|$)");
  }

  function each(ar, fn, scope) {
    for (var i = 0, l = ar.length; i < l; i++) {
      fn.call(scope || ar[i], ar[i], i, ar);
    }
    return ar;
  }

  var trim = String.prototype.trim ?
    function (s) {
      return s.trim();
    } :
    function (s) {
      return s.replace(trimReplace, '');
    };

  function camelize(s) {
    return s.replace(/-(.)/g, function (m, m1) {
      return m1.toUpperCase();
    });
  }

  function is(node) {
    return node && node.nodeName && node.nodeType == 1;
  }

  function some(ar, fn, scope) {
    for (var i = 0, j = ar.length; i < j; ++i) {
      if (fn.call(scope, ar[i], i, ar)) {
        return true;
      }
    }
    return false;
  }

  var getStyle = doc.defaultView && doc.defaultView.getComputedStyle ?
    function (el, property) {
      var value = null;
      if (property == 'float') {
        property = 'cssFloat';
      }
      var computed = doc.defaultView.getComputedStyle(el, '');
      computed && (value = computed[camelize(property)]);
      return el.style[property] || value;

    } : (ie && html.currentStyle) ?

    function (el, property) {
      property = camelize(property);
      property = property == 'float' ? 'styleFloat' : property;

      if (property == 'opacity') {
        var val = 100;
        try {
          val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
        } catch (e1) {
          try {
            val = el.filters('alpha').opacity;
          } catch (e2) {}
        }
        return val / 100;
      }
      var value = el.currentStyle ? el.currentStyle[property] : null;
      return el.style[property] || value;
    } :

    function (el, property) {
      return el.style[camelize(property)];
    };

  function insert(target, host, fn) {
    var i = 0, self = host || this, r = [];
    each(normalize(query ? query(target) : target), function (t) {
      each(self, function (el) {
        var n = el.cloneNode(true);
        fn(t, n);
        r[i] = n;
        i++;
      });
    }, this);
    each(r, function (e, i) {
      self[i] = e;
    });
    self.length = i;
    return self;
  }

  function xy(el, x, y) {
    var $el = bonzo(el),
        style = $el.css('position'),
        offset = $el.offset(),
        rel = 'relative',
        isRel = style == rel,
        delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)];

    if (style == 'static') {
      $el.css('position', rel);
      style = rel;
    }

    isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft);
    isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop);

    x !== null && (el.style.left = x - offset.left + delta[0] + 'px');
    y !== null && (el.style.top = y - offset.top + delta[1] + 'px');

  }

  function Bonzo(elements) {
    this.length = 0;
    this.original = elements;
    if (elements) {
      elements = typeof elements !== 'string' &&
        !elements.nodeType &&
        typeof elements.length !== 'undefined' ?
          elements :
          [elements];
      this.length = elements.length;
      for (var i = 0; i < elements.length; i++) {
        this[i] = elements[i];
      }
    }
  }

  Bonzo.prototype = {

    each: function (fn, scope) {
      return each(this, fn, scope);
    },

    map: function (fn, reject) {
      var m = [], n, i;
      for (i = 0; i < this.length; i++) {
        n = fn.call(this, this[i]);
        reject ? (reject(n) && m.push(n)) : m.push(n);
      }
      return m;
    },

    first: function () {
      return bonzo(this[0]);
    },

    last: function () {
      return bonzo(this[this.length - 1]);
    },

    html: function (h, text) {
      var method = text ?
        html.textContent == null ?
          'innerText' :
          'textContent' :
        'innerHTML', m;
      function append(el, tag) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
        each(normalize(h, tag), function (node) {
          el.appendChild(node);
        });
      }
      return typeof h !== 'undefined' ?
          this.each(function (el) {
            (m = el.tagName.match(specialTags)) ?
              append(el, m[0]) :
              (el[method] = h);
          }) :
        this[0] ? this[0][method] : '';
    },

    text: function (text) {
      return this.html(text, 1);
    },

    addClass: function (c) {
      return this.each(function (el) {
        this.hasClass(el, c) || (el.className = trim(el.className + ' ' + c));
      }, this);
    },

    removeClass: function (c) {
      return this.each(function (el) {
        this.hasClass(el, c) && (el.className = trim(el.className.replace(classReg(c), ' ')));
      }, this);
    },

    hasClass: function (el, c) {
      return typeof c == 'undefined' ?
        some(this, function (i) {
          return classReg(el).test(i.className);
        }) :
        classReg(c).test(el.className);
    },

    toggleClass: function (c, condition) {
      if (typeof condition !== 'undefined' && !condition) {
        return this;
      }
      return this.each(function (el) {
        this.hasClass(el, c) ?
          (el.className = trim(el.className.replace(classReg(c), ' '))) :
          (el.className = trim(el.className + ' ' + c));
      }, this);
    },

    show: function (type) {
      return this.each(function (el) {
        el.style.display = type || '';
      });
    },

    hide: function (elements) {
      return this.each(function (el) {
        el.style.display = 'none';
      });
    },

    append: function (node) {
      return this.each(function (el) {
        each(normalize(node), function (i) {
          el.appendChild(i);
        });
      });
    },

    prepend: function (node) {
      return this.each(function (el) {
        var first = el.firstChild;
        each(normalize(node), function (i) {
          el.insertBefore(i, first);
        });
      });
    },

    appendTo: function (target, host) {
      return insert.call(this, target, host, function (t, el) {
        t.appendChild(el);
      });
    },

    prependTo: function (target, host) {
      return insert.call(this, target, host, function (t, el) {
        t.insertBefore(el, t.firstChild);
      });
    },

    next: function () {
      return this.related('nextSibling');
    },

    previous: function () {
      return this.related('previousSibling');
    },

    related: function (method) {
      return this.map(
        function (el) {
          el = el[method];
          while (el && el.nodeType !== 1) {
            el = el[method];
          }
          return el || 0;
        },
        function (el) {
          return el;
        }
      );
    },

    before: function (node) {
      return this.each(function (el) {
        each(bonzo.create(node), function (i) {
          el.parentNode.insertBefore(i, el);
        });
      });
    },

    after: function (node) {
      return this.each(function (el) {
        each(bonzo.create(node), function (i) {
          el.parentNode.insertBefore(i, el.nextSibling);
        });
      });
    },

    insertBefore: function (target, host) {
      return insert.call(this, target, host, function (t, el) {
        t.parentNode.insertBefore(el, t);
      });
    },

    insertAfter: function (target, host) {
      return insert.call(this, target, host, function (t, el) {
        var sibling = t.nextSibling;
        if (sibling) {
          t.parentNode.insertBefore(el, sibling);
        }
        else {
          t.parentNode.appendChild(el);
        }
      });
    },

    css: function (o, v) {
      // is this a request for just getting a style?
      if (v === undefined && typeof o == 'string') {
        return getStyle(this[0], o);
      }
      var iter = o;
      if (typeof o == 'string') {
        iter = {};
        iter[o] = v;
      }

      if (ie && iter.opacity) {
        // oh this 'ol gamut
        iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')';
        // give it layout
        iter.zoom = o.zoom || 1;
        delete iter.opacity;
      }

      if (v = iter['float']) {
        // float is a reserved style word. w3 uses cssFloat, ie uses styleFloat
        ie ? (iter.styleFloat = v) : (iter.cssFloat = v);
        delete iter['float'];
      }

      var fn = function (el, p, v) {
        for (var k in iter) {
          if (iter.hasOwnProperty(k)) {
            v = iter[k];
            // change "5" to "5px" - unless you're line-height, which is allowed
            (p = camelize(k)) && digit.test(v) && !(p in unitless) && (v += px);
            el.style[p] = v;
          }
        }
      };
      return this.each(fn);
    },

    offset: function (x, y) {
      if (x || y) {
        return this.each(function (el) {
          xy(el, x, y);
        });
      }
      var el = this[0];
      var width = el.offsetWidth;
      var height = el.offsetHeight;
      var top = el.offsetTop;
      var left = el.offsetLeft;
      while (el = el.offsetParent) {
        top = top + el.offsetTop;
        left = left + el.offsetLeft;
      }

      return {
        top: top,
        left: left,
        height: height,
        width: width
      };
    },

    attr: function (k, v) {
      var el = this[0];
      return typeof v == 'undefined' ?
        specialAttributes.test(k) ?
          stateAttributes.test(k) && typeof el[k] == 'string' ?
            true : el[k] : el[getAttribute](k) :
        this.each(function (el) {
          k == 'value' ? (el.value = v) : el[setAttribute](k, v);
        });
    },

    val: function (s) {
      return (typeof s == 'string') ? this.attr('value', s) : this[0].value;
    },

    removeAttr: function (k) {
      return this.each(function (el) {
        el.removeAttribute(k);
      });
    },

    data: function (k, v) {
      var el = this[0];
      if (typeof v === 'undefined') {
        el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids);
        var uid = el[getAttribute]('data-node-uid');
        uidList[uid] || (uidList[uid] = {});
        return uidList[uid][k];
      } else {
        return this.each(function (el) {
          el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids);
          var uid = el[getAttribute]('data-node-uid');
          var o = {};
          o[k] = v;
          uidList[uid] = o;
        });
      }
    },

    remove: function () {
      return this.each(function (el) {
        el.parentNode && el.parentNode.removeChild(el);
      });
    },

    empty: function () {
      return this.each(function (el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      });
    },

    detach: function () {
      return this.map(function (el) {
        return el.parentNode.removeChild(el);
      });
    },

    scrollTop: function (y) {
      return scroll.call(this, null, y, 'y');
    },

    scrollLeft: function (x) {
      return scroll.call(this, x, null, 'x');
    }
  };

  function normalize(node, tag) {
    return typeof node == 'string' ? bonzo.create(node, tag) : is(node) ? [node] : node;
  }

  function scroll(x, y, type) {
    var el = this[0];
    if (x == null && y == null) {
      return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type];
    }
    if (isBody(el)) {
      window.scrollTo(x, y);
    } else {
      x != null && (el.scrollLeft = x);
      y != null && (el.scrollTop = y);
    }
    return this;
  }

  function isBody(element) {
    return element === window || (/^(?:body|html)$/i).test(element.tagName);
  }

  function getWindowScroll() {
    return { x: window.pageXOffset || html.scrollLeft, y: window.pageYOffset || html.scrollTop };
  }

  function bonzo(els, host) {
    return new Bonzo(els, host);
  }

  bonzo.setQueryEngine = function (q) {
    query = q;
    delete bonzo.setQueryEngine;
  };

  bonzo.aug = function (o, target) {
    for (var k in o) {
      o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k]);
    }
  };

  bonzo.create = function (node, tag) {
    return typeof node == 'string' ?
      function () {
        var t = tag ? tagMap[tag.toLowerCase()] : null;
        var el = doc.createElement(t || 'div'), els = [];
        if (tag) {
          var bitches = node.match(new RegExp("<" + t + ">.+?<\\/" + t + ">", "g"));
          each(bitches, function (m) {
            m = m.replace(/<(.+)>(.+?)<\/\1>/, '$2');
            var bah = doc.createElement(t);
            bah.appendChild(doc.createDocumentFragment(m));
            el.appendChild(bah);
          });
        } else {
          el.innerHTML = node;
        }
        var nodes = el.childNodes;
        el = el.firstChild;
        els.push(el);
        while (el = el.nextSibling) {
          (el.nodeType == 1) && els.push(el);
        }
        return els;

      }() : is(node) ? [node.cloneNode(true)] : [];
  };

  bonzo.doc = function () {
    var w = html.scrollWidth,
        h = html.scrollHeight,
        vp = this.viewport();
    return {
      width: Math.max(w, vp.width),
      height: Math.max(h, vp.height)
    };
  };

  bonzo.firstChild = function (el) {
    for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
      if (c[i].nodeType === 1) {
        e = c[j = i];
      }
    }
    return e;
  };

  bonzo.viewport = function () {
    var h = self.innerHeight,
        w = self.innerWidth;
    ie && (h = html.clientHeight) && (w = html.clientWidth);
    return {
      width: w,
      height: h
    };
  };

  bonzo.isAncestor = 'compareDocumentPosition' in html ?
    function (container, element) {
      return (container.compareDocumentPosition(element) & 16) == 16;
    } : 'contains' in html ?
    function (container, element) {
      return container !== element && container.contains(element);
    } :
    function (container, element) {
      while (element = element.parentNode) {
        if (element === container) {
          return true;
        }
      }
      return false;
    };

  var old = context.bonzo;
  bonzo.noConflict = function () {
    context.bonzo = old;
    return this;
  };
  context['bonzo'] = bonzo;

}(this);!function ($) {

  var b = bonzo;
  b.setQueryEngine($);
  $.ender(b);
  $.ender(b(), true);
  $.ender({
    create: function (node) {
      return $(b.create(node));
    }
  });

  $.id = function (id) {
    return $([document.getElementById(id)]);
  };

  function indexOf(ar, val) {
    for (var i = 0; i < ar.length; i++) {
      if (ar[i] === val) {
        return i;
      }
    }
    return -1;
  }

  function uniq(ar) {
    var a = [], i, j;
    label:
    for (i = 0; i < ar.length; i++) {
      for (j = 0; j < a.length; j++) {
        if (a[j] == ar[i]) {
          continue label;
        }
      }
      a[a.length] = ar[i];
    }
    return a;
  }

  $.ender({
    parents: function (selector, closest) {
      var collection = $(selector), j, k, p, r = [];
      for (j = 0, k = this.length; j < k; j++) {
        p = this[j];
        while (p = p.parentNode) {
          if (indexOf(collection, p) !== -1) {
            r.push(p);
            if (closest) break;
          }
        }
      }
      return $(uniq(r));
    },

    closest: function (selector) {
      return this.parents(selector, true);
    },

    first: function () {
      return $(this[0]);
    },

    last: function () {
      return $(this[this.length - 1]);
    },

    next: function () {
      return $(b(this).next());
    },

    previous: function () {
      return $(b(this).previous());
    },

    appendTo: function (t) {
      return b(this.selector).appendTo(t, this);
    },

    prependTo: function (t) {
      return b(this.selector).prependTo(t, this);
    },

    insertAfter: function (t) {
      return b(this.selector).insertAfter(t, this);
    },

    insertBefore: function (t) {
      return b(this.selector).insertBefore(t, this);
    },

    siblings: function () {
      var i, l, p, r = [];
      for (i = 0, l = this.length; i < l; i++) {
        p = this[i];
        while (p = p.previousSibling) {
          p.nodeType == 1 && r.push(p);
        }
        p = this[i];
        while (p = p.nextSibling) {
          p.nodeType == 1 && r.push(p);
        }
      }
      return $(r);
    },

    children: function () {
      var el, r = [];
      for (i = 0, l = this.length; i < l; i++) {
        if (!(el = b.firstChild(this[i]))) {
          continue;
        }
        r.push(el);
        while (el = el.nextSibling) {
          el.nodeType == 1 && r.push(el);
        }
      }
      return $(uniq(r));
    },

    height: function (v) {
      return v ? this.css('height', v) : parseInt(this.css('height'), 10);
    },

    width: function (v) {
      return v ? this.css('width', v) : parseInt(this.css('width'), 10);
    }
  }, true);

}(ender || $);

!function () { var exports = {}, module = { exports: exports }; !function (doc) {
  var loaded = 0, fns = [], ol, f = false,
      testEl = doc.createElement('a'),
      domContentLoaded = 'DOMContentLoaded',
      addEventListener = 'addEventListener',
      onreadystatechange = 'onreadystatechange';

  /^loade|c/.test(doc.readyState) && (loaded = 1);

  function flush() {
    loaded = 1;
    for (var i = 0, l = fns.length; i < l; i++) {
      fns[i]();
    }
  }
  doc[addEventListener] && doc[addEventListener](domContentLoaded, function fn() {
    doc.removeEventListener(domContentLoaded, fn, f);
    flush();
  }, f);


  testEl.doScroll && doc.attachEvent(onreadystatechange, (ol = function ol() {
    if (/^c/.test(doc.readyState)) {
      doc.detachEvent(onreadystatechange, ol);
      flush();
    }
  }));

  var domReady = testEl.doScroll ?
    function (fn) {
      self != top ?
        !loaded ?
          fns.push(fn) :
          fn() :
        !function () {
          try {
            testEl.doScroll('left');
          } catch (e) {
            return setTimeout(function() {
              domReady(fn);
            }, 50);
          }
          fn();
        }();
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn);
    };

    (typeof module !== 'undefined') && module.exports ?
      (module.exports = {domReady: domReady}) :
      (window.domReady = domReady);

}(document); $.ender(module.exports); }.call($);