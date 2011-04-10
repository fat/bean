!function (context) {
  var _uid = 1, registry = {}, collected = {},
      overOut = /over|out/,
      addEvent = 'addEventListener',
      attachEvent = 'attachEvent',
      removeEvent = 'removeEventListener',
      detachEvent = 'detachEvent';

  function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
  }

  function retrieveEvents(element) {
    var uid = retrieveUid(element);
    return (registry[uid] = registry[uid] || {});
  }

  function retrieveUid(obj) {
    return (obj._uid = obj._uid || _uid++);
  }

  function listener(element, type, fn, add, custom) {
    if (element[addEvent]) {
      element[add ? addEvent : removeEvent](type, fn, false);
    } else if (element[attachEvent]) {
      custom && add && (element['_on' + custom] = element['_on' + custom] || 0);
      element[add ? attachEvent : detachEvent]('on' + type, fn);
    }
  }

  function nativeHandler(element, fn, args) {
    return function (event) {
      event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || window).event);
      return fn.apply(element, [event].concat(args));
    };
  }

  function customHandler(element, fn, type, condition, args) {
    return function (event) {
      if (condition ? condition.call(this, event) : event && event.propertyName == '_on' + type || !event) {
        fn.apply(element, [event].concat(args));
      }
    };
  }

  function addListener(element, type, fn, args) {
    var events = retrieveEvents(element), handlers = events[type] || (events[type] = {}), uid = retrieveUid(fn);
    if (handlers[uid]) {
      return element;
    }
    var custom = customEvents[type];
    fn = custom && custom.condition ? customHandler(element, fn, type, custom.condition) : fn;
    type = custom && custom.base || type;
    var isNative = window[addEvent] || nativeEvents.indexOf(type) > -1;
    fn = isNative ? nativeHandler(element, fn, args) : customHandler(element, fn, type, false, args)
    if (type == 'unload') {
      var org = fn;
      fn = function () { removeListener(element, type, fn) && org(); };
    }
    listener(element, isNative ? type : 'propertychange', fn, true, !isNative && true)
    handlers[uid] = fn;
    fn._uid = uid;
    return type == 'unload' ? element : (collected[retrieveUid(element)] = element);
  }

  function removeListener(element, type, handler) {
    var events = retrieveEvents(element);
    if (!events || !events[type]) {
      return element;
    }
    handler = events[type][handler._uid];
    delete events[type][handler._uid];
    type = customEvents[type] ? customEvents[type].base : type;
    var isNative = element[addEvent] || nativeEvents.indexOf(type) > -1;
    listener(element, isNative ? type : 'propertychange', handler, false, !isNative && type);
    return element;
  }

  function del(selector, fn, $) {
    return function (e) {
      var array = typeof selector == 'string' ? $(selector, this) : selector;
      for (var target = e.target; target && target != this; target = target.parentNode) {
        for (var i = array.length; i--;) {
          if (array[i] == target) {
            return fn.apply(target, arguments);
          }
        }
      }
    };
  }

  function add(element, events, fn, delfn, $) {
    if (typeof events == 'object' && !fn) {
      for (var type in events) {
        events.hasOwnProperty(type) && add(element, type, events[type]);
      }
    } else {
      var isDel = typeof fn == 'string', types = (isDel ? fn : events).split(' ');
      fn = isDel ? del(events, delfn, $) : fn;
      for (var i = types.length; i--;) {
        addListener(element, types[i], fn, Array.prototype.slice.call(arguments, isDel ? 4 : 3));
      }
    }
    return element;
  }

  function remove(element, events, fn) {
    var k, type, isString = typeof(events) == 'string', rm = removeListener, attached = retrieveEvents(element);
    if (isString && /\s/.test(events)) {
      events = events.split(' ');
      var i = events.length - 1;
      while (remove(element, events[i]), i--);
      return element;
    }
    if (!attached || (isString && !attached[events])) {
      return element;
    }
    if (typeof fn == 'function') {
      rm(element, events, fn);
    } else {
      rm = events ? rm : remove;
      type = isString && events;
      events = events ? (fn || attached[events] || events) : attached;
      for (k in events) {
        events.hasOwnProperty(k) && rm(element, type || k, events[k]);
      }
    }
    return element;
  }

  function fire(element, type) {
    var evt, k, i, types = type.split(' ');
    for (i = types.length; i--;) {
      type = types[i];
      var isNative = nativeEvents.indexOf(type) > -1;
      if (element[addEvent]) {
        evt = document.createEvent(isNative ? "HTMLEvents" : "UIEvents");
        evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, window, 1);
        element.dispatchEvent(evt);
      } else if (element[attachEvent]){
        isNative ? element.fireEvent('on' + type, document.createEventObject()) : element['_on' + type]++;
      } else {
        var handlers = retrieveEvents(element)[type];
        for (k in handlers) {
          handlers.hasOwnProperty(k) && handlers[k]();
        }
      }
    }
    return element;
  }

  function clone(element, from, type) {
    var events = retrieveEvents(from), obj, k;
    obj = type ? events[type] : events;
    for (k in obj) {
      obj.hasOwnProperty(k) && (type ? add : clone)(element, type || from, type ? obj[k] : k);
    }
    return element;
  }

  function fixEvent(e) {
    if (!e) {
      return {};
    }
    var type = e.type, target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || fixEvent.preventDefault;
    e.stopPropagation = e.stopPropagation || fixEvent.stopPropagation;
    e.target = target && target.nodeType == 3 ? target.parentNode : target;
    if (type.indexOf('key') != -1) {
      e.keyCode = e.which || e.keyCode;
    } else if ((/click|mouse|menu/i).test(type)) {
      e.rightClick = e.which == 3 || e.button == 2;
      e.pos = { x: 0, y: 0 };
      if (e.pageX || e.pageY) {
        e.pos.x = e.pageX;
        e.pos.y = e.pageY;
      } else if (e.clientX || e.clientY) {
        e.pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        e.pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      overOut.test(type) && (e.relatedTarget = e.relatedTarget || e[(type == 'mouseover' ? 'from' : 'to') + 'Element']);
    }
    return e;
  }
  fixEvent.preventDefault = function () {
    this.returnValue = false;
  };
  fixEvent.stopPropagation = function () {
    this.cancelBubble = true;
  };

  var nativeEvents = 'click,dblclick,mouseup,mousedown,contextmenu,' + //mouse buttons
    'mousewheel,DOMMouseScroll,' + //mouse wheel
    'mouseover,mouseout,mousemove,selectstart,selectend,' + //mouse movement
    'keydown,keypress,keyup,' + //keyboard
    'orientationchange,' + // mobile
    'touchstart,touchmove,touchend,touchcancel,' + // touch
    'gesturestart,gesturechange,gestureend,' + // gesture
    'focus,blur,change,reset,select,submit,' + //form elements
    'load,unload,beforeunload,resize,move,DOMContentLoaded,readystatechange,' + //window
    'error,abort,scroll'.split(','); //misc

  function check(event) {
    var related = event.relatedTarget;
    if (!related) {
      return related == null;
    }
    return (related != this && related.prefix != 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related));
  }

  var customEvents = {
    mouseenter: { base: 'mouseover', condition: check },
    mouseleave: { base: 'mouseout', condition: check }
  };

  var evnt = { add: add, remove: remove, clone: clone, fire: fire };

  var clean = function (el) {
    var uid = remove(el)._uid;
    if (uid) {
      delete collected[uid];
      delete registry[uid];
    }
  };

 if (window[attachEvent]) {
    add(window, 'unload', function () {
      for (var k in collected) {
        collected.hasOwnProperty(k) && clean(collected[k]);
      }
      window.CollectGarbage && CollectGarbage();
    });
  }

  var oldEvnt = context.evnt;
  evnt.noConflict = function () {
    context.evnt = oldEvnt;
    return this;
  };

  (typeof module !== 'undefined' && module.exports) ?
    (module.exports = evnt) :
    (context.evnt = evnt);

}(this);