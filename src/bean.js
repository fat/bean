!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition();
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
  else this[name] = definition();
}('bean', function () {
  var context = this,
      old = this.bean,
      win = window,
      overOut = /over|out/,
      namespace = /[^\.]*(?=\..*)\.|.*/,
      stripName = /\..*/,
      own = 'hasOwnProperty',
      addEvent = 'addEventListener',
      attachEvent = 'attachEvent',
      removeEvent = 'removeEventListener',
      detachEvent = 'detachEvent',
      doc = document || {},
      root = doc.documentElement || {},
      W3C_MODEL = root[addEvent],
      eventSupport = W3C_MODEL ? addEvent : attachEvent,
      slice = Array.prototype.slice,
      ONE = {one:1}, // singleton for quick matching making add() do one()

  RegEntry = function () {
    function entry(element, type, handler, original, namespaces) {
      this.element = element;
      this.type = type;
      this.handler = handler;
      this.original = original;
      this.namespaces = namespaces;
      this.isNative = nativeEvents[type] && element[eventSupport];
      this.custom = customEvents[type];
      this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange';
      this.customType = !W3C_MODEL && !this.isNative && type;
      this.targetElement = targetElement(element, this.isNative);
      this.eventSupport = this.targetElement[eventSupport];
    }
    entry.prototype.inNamespaces = function (namespaces) {
      var i, j;
      if (!namespaces) return true;
      if (!this.namespaces) return false;
      for (i = namespaces.length; i--;) {
        for (j = this.namespaces.length; j--;) {
          if (namespaces[i] === this.namespaces[j]) return true;
        }
      }
      return false;
    }
    entry.prototype.matches = function (element, original, handler) {
      return this.element === element &&
        (!original || this.original === original) &&
        (!handler || this.handler === handler);
    }
    return entry;
  }(),

  registry = function () {
    var map = {},
      forAll = function (element, type, original, handler, fn) {
        if (!type || type === '*') {
          for (var t in map) map[own](t) && forAll(element, t, original, handler, fn);
        } else {
          var i = 0, list = map[type], all = element === '*';
          if (!list) return;
          for (i = list.length; i--;) {
            if (all || list[i].matches(element, original, handler))
              if (!fn(list[i], list, i, type)) return;
          }
        }
      },
      has = function (element, type, original) {
        var i, list = map[type]
        if (list) {
          for (i = list.length; i--;) {
            if (list[i].matches(element, original, null)) return true;
          }
        }
        return false;
      },
      get = function (element, type, original) {
        var entries = [];
        forAll(element, type, original, null, function(entry) { return entries.push(entry); });
        return entries;
      },
      put = function (entry) {
        (map[entry.type] || (map[entry.type] = [])).push(entry);
        return entry;
      },
      del = function (entry) {
        forAll(entry.element, entry.type, null, entry.handler, function(entry, list, i) {
          list.splice(i, 1);
          return false;
        });
      },
      entries = function () {
        var t, entries = [];
        for (t in map) map(t) && (entries = entries.concat(map[t]));
        return entries;
      },
      // probably temporary, not for production release
      size = function() {
        var c = 0
        forAll('*', '*', null, null, function() { c++ })
        return c;
      }
    return { forAll: forAll, has: has, get: get, put: put, del: del, entries: entries, size: size };
  }(),

  isDescendant = function (parent, node) {
    while ((node = node.parentNode) !== null) {
      if (node === parent) return true;
    }
    return false;
  },

  listener = W3C_MODEL ? function (element, type, fn, add) {
    element[add ? addEvent : removeEvent](type, fn, false);
  } : function (element, type, fn, add, custom) {
    if (custom && add && element['_on' + custom] === null) element['_on' + custom] = 0;
    element[add ? attachEvent : detachEvent]('on' + type, fn);
  },

  nativeHandler = function (element, fn, args) {
    return function (event) {
      event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true);
      return fn.apply(element, [event].concat(args));
    };
  },

  customHandler = function (element, fn, type, condition, args, isNative) {
    return function (event) {
      if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
        if (event)
          event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative);
        fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args));
      }
    };
  },

  targetElement = function (element, isNative) {
    return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element;
  },

  addListener = function (element, orgType, fn, originalFn, args) {
    var entry, type = orgType.replace(stripName, ''),
      namespaces = orgType.replace(namespace, '').split('.');

    if (registry.has(element, type, fn)) { return element; }
    if (type === 'unload') fn = once(removeListener, element, type, fn, originalFn);
    if (customEvents[type]) {
      fn = customEvents[type].condition ? customHandler(element, fn, type, customEvents[type].condition, true) : fn;
      type = customEvents[type].base || type;
    }
    entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces));
    entry.handler = entry.isNative ?
      nativeHandler(element, entry.handler, args) :
      customHandler(element, entry.handler, type, false, args, false);
    if (entry.eventSupport)
      listener(entry.targetElement, entry.eventType, entry.handler, true, entry.customType);
  },

  removeListener = function (element, orgType, handler, names) {
    var i, l, entry, type = (orgType && orgType.replace(stripName, '')),
      handlers = registry.get(element, type, handler);

    for (i = 0, l = handlers.length; i < l; i++) {
      if (handlers[i].inNamespaces(names)) {
        if ((entry = handlers[i]).eventSupport)
          listener(entry.targetElement, entry.eventType, entry.handler, false, entry.type);
        registry.del(entry)
      }
    }
  },

  del = function (selector, fn, $) {
    return function (e) {
      var target, i, array = typeof selector === 'string' ? $(selector, this) : selector;
      for (target = e.target; target && target !== this; target = target.parentNode) {
        for (i = array.length; i--;) {
          if (array[i] === target) {
            return fn.apply(target, arguments);
          }
        }
      }
    };
  },

  add = function (element, events, fn, delfn, $) {
    var type, types, i, args, originalFn = fn, isDel = fn && typeof fn === 'string';
    if (events && !fn && typeof events === 'object') {
      for (type in events) {
        events[own](type) && add.apply(this, [ element, type, events[type] ]);
      }
    } else {
      args = arguments.length > 3 ? slice.call(arguments, 3) : [];
      types = (isDel ? fn : events).split(' ');
      isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1));
      this === ONE && (fn = once(remove, element, events, fn, originalFn));
      for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args);
    }
    return element;
  },

  once = function (rm, element, type, fn, originalFn) {
    return function () { rm(element, type, originalFn) && fn.apply(this, arguments); };
  },

  one = function () {
    return add.apply(ONE, arguments)
  },

  remove = function (element, orgEvents, fn) {
    var k, m, type, events, i, names, rm = removeListener,
        isString = orgEvents && typeof orgEvents === 'string';
    if (isString && orgEvents.indexOf(' ') > 0) {
      orgEvents = orgEvents.split(' ');
      for (i = orgEvents.length; i-- && remove(element, orgEvents[i], fn);) {}
      return element;
    }
    events = isString ? orgEvents.replace(stripName, '') : orgEvents;
    if (fn && typeof fn === 'function') {
      rm(element, events, fn);
    } else {
      if (names = isString && orgEvents.replace(namespace, '')) names = names.split('.');
      rm(element, type, null, names)
    }
    return element;
  },

  fire = function (element, type, args) {
    var i, j, l, names, handlers, types = type.split(' ');
    for (i = types.length; i--;) {
      type = types[i].replace(stripName, '');
      if (names = types[i].replace(namespace, '')) names = names.split('.');
      if (!names && !args && element[eventSupport]) {
        fireListener(nativeEvents[type], type, element);
      } else {
        handlers = registry.get(element, type);
        args = [false].concat(args);
        for (j = 0, l = handlers.length; j < l; j++) {
          if (handlers[j].inNamespaces && handlers[j].inNamespaces(names))
            handlers[j].handler.apply(element, args);
        }
      }
    }
    return element;
  },

  fireListener = W3C_MODEL ? function (isNative, type, element) {
    var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents');
    evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1);
    element.dispatchEvent(evt);
  } : function (isNative, type, element) {
    element = targetElement(element, isNative);
    isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++;
  },

  clone = function (element, from, type) {
    var i = 0, handlers = registry.get(from, type), l = handlers.length;
    for (;i < l; i++)
      handlers[i].original && add(element, handlers[i].type, handlers[i].original)
    return element;
  },

  copyProps = 'altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' '), // thanks to jQuery for this basis of this list

  fixEvent = function (event, isNative) {
    var result = {};
    if (!event) return result;
    var i, p, type = event.type, target = event.target || event.srcElement;
    result.preventDefault = fixEvent.preventDefault(event);
    result.stopPropagation = fixEvent.stopPropagation(event);
    result.target = target && target.nodeType === 3 ? target.parentNode : target;
    if (isNative) { // we only need basic augmentation on custom events
      if (~type.indexOf('key')) {
        result.keyCode = event.which || event.keyCode;
      } else if ((/click|mouse|menu/i).test(type)) {
        result.rightClick = event.which === 3 || event.button === 2;
        result.pos = { x: 0, y: 0 };
        if (event.pageX || event.pageY) {
          result.clientX = event.pageX;
          result.clientY = event.pageY;
        } else if (event.clientX || event.clientY) {
          result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft;
          result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop;
        }
        if (overOut.test(type))
          result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
      }
      for (i = copyProps.length; i--;) {
        p = copyProps[i];
        if (!(p in result) && p in event) result[p] = event[p];
      }
    }
    return result;
  };

  fixEvent.preventDefault = function (e) {
    return function () {
      if (e.preventDefault)
        e.preventDefault();
      else
        e.returnValue = false;
    };
  }

  fixEvent.stopPropagation = function (e) {
    return function () {
      if (e.stopPropagation)
        e.stopPropagation();
      else
        e.cancelBubble = true;
    };
  }

  var nativeEvents = { click: 1, dblclick: 1, mouseup: 1, mousedown: 1, contextmenu: 1, //mouse buttons
    mousewheel: 1, DOMMouseScroll: 1, //mouse wheel
    mouseover: 1, mouseout: 1, mousemove: 1, selectstart: 1, selectend: 1, //mouse movement
    keydown: 1, keypress: 1, keyup: 1, //keyboard
    orientationchange: 1, // mobile
    touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1, // touch
    gesturestart: 1, gesturechange: 1, gestureend: 1, // gesture
    focus: 1, blur: 1, change: 1, reset: 1, select: 1, submit: 1, //form elements
    load: 1, unload: 1, beforeunload: 1, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
    error: 1, abort: 1, scroll: 1 }; //misc

  function check(event) {
    var related = event.relatedTarget;
    if (!related) return related === null;
    return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related));
  }

  var customEvents = {
    mouseenter: { base: 'mouseover', condition: check },
    mouseleave: { base: 'mouseout', condition: check },
    mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
  };

  var bean = { add: add, one: one, remove: remove, clone: clone, fire: fire };

  if (win[attachEvent]) {
    var cleanup = function () {
      var i, entries = registry.entries();
      for (i in entries) {
        if (entries[i].type && entries[i].type !== 'unload')
          remove(entries[i].element, entries[i].type);
      }
      win[detachEvent]('onunload', cleanup);
      win.CollectGarbage && CollectGarbage();
    };
    win[attachEvent]('onunload', cleanup);
  }

  bean.noConflict = function () {
    context.bean = old;
    return this;
  };

  // temporary for debugging, not for production release
  bean.registry = registry

  return bean;

});
