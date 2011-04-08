//smooshing mootools eventy stuff and dean edwards eventy stuff
!function (context) {

  var _uid = 1,
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
    return false;
  }

  function retrieveEvents(element) {
    return (element._events = element._events || {});
  }

  function retrieveUid(handler) {
    return (handler._uid = handler._uid || _uid++);
  }

  function listener(element, type, fn, add, custom) {
    if (element[addEvent]) { //w3c
      return element[add ? addEvent : removeEvent](type, fn, false);
    }
    if (custom) {
      element['_on' + custom] = element['_' + custom] || 0;
    }
    element[add ? attachEvent : detachEvent]('on' + type, fn);
  }

  function nativeHandler(element, fn) {
    return function (event) {
      event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
      if (fn.call(element, event) === false) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };
  }

  function customHandler(element, fn, type, condition) {
    return function (event) {
      if (condition ? condition.call(this, event) : event.propertyName == '_' + type) {
        fn.call(element, event);
      }
      return true;
    };
  }

  function addListener(element, type, fn) {
    var events = retrieveEvents(element),
        handlers = events[type];
    if (!handlers) {
      handlers = events[type] = {};
      if (element["on" + type]) {
        handlers[0] = element["on" + type];
      }
    }
    var uid = retrieveUid(fn);
    if (handlers[uid]) {
      return element; //don't add same handler twice
    }
    var custom = customEvents[type];
    if (custom) {
      if (custom.condition) {
        fn = customHandler(element, fn, type, custom.condition);
      }
      type = custom.base || type;
    }
    if (element[addEvent] || nativeEvents.indexOf(type) > -1) {
      fn = nativeHandler(element, fn);
      listener(element, type, fn, true);
    } else { //ie custom events
      fn = customHandler(element, fn, type);
      listener(element, 'onpropertychange', fn, true, type);
    }
    handlers[uid] = fn;
    fn._uid = uid;
    return element;
  }

  function removeListener(element, type, handler) {
    var events = retrieveEvents(element);
    if (!events || !events[type]) {
      return element;
    }
    handler = events[type][handler._uid];
    delete events[type][handler._uid];
    type = customEvents[type] ? customEvents[type].base : type;
    if (element[addEvent] || nativeEvents.indexOf(type) > -1) {
      listener(element, type, handler, false);
    } else {
      listener(element, 'onpropertychange', handler, false, type);
    }
    return element;
  }

  function add(element, events, fn, $) {
    if (typeof events == 'object') {
      for (var type in events) {
        if (events.hasOwnProperty(type)) {
          addListener(element, type, events[type]);
        }
      }
    } else {
      addListener(element, events, fn);
    }
    return element;
  }

  function remove(element, events, fn) {
    var k, type, isString = typeof(events) == 'string', rm = removeListener, attached = retrieveEvents(element);
    if (!attached || (isString && !attached[events])) {
      return element;
    }
    if (typeof fn == 'function') {
      rm(element, events, fn);
    }
    else {
      if (!events) {
        events = attached;
        rm = remove;
      } else {
        type = isString && events;
        events = fn || attached[events] || events;
      }
      for (k in events) {
        if (events.hasOwnProperty(k)) {
          rm(element, type || k, events[k]);
        }
      }
    }
    return element;
  }

  function fire(element, type, args) {
    var evt;
    if (nativeEvents.indexOf(type) > -1) {
      if (document.createEventObject) {
        evt = document.createEventObject();
        return element.fireEvent('on' + type, evt);
      }
      else {
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);
        return !element.dispatchEvent(evt);
      }
    } else {
      if (element[addEvent]) {
        evt = document.createEvent("UIEvents");
        evt.initEvent(type, false, false);
        element.dispatchEvent(evt);
      } else {
        element['_on' + type]++;
      }
    }
  }

  function clone(element, from, type) {
    var events = retrieveEvents(from), eventType, fat, k, obj;
    if (!events) {
      return element;
    }
    obj = type ? events[type] : events;
    method = type ? add : function (e, k) {
      clone(element, from, k);
    };
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        method(element, type || k, obj[k]);
      }
    }
    return element;
  }

  function fixEvent(e) {
    var type = e.type;
    e = e || {};
    e.preventDefault = fixEvent.preventDefault;
    e.stopPropagation = fixEvent.stopPropagation;
    e.target = e.target || e.srcElement;
    if (e.target.nodeType == 3) {
      e.target = e.target.parentNode;
    }
    if (type.indexOf('key') != -1) {
      if (e.which) {
        e.keyCode = e.which;
      }
    } else if ((/click|mouse|menu/i).test(type)) {
      e.rightClick = (e.which == 3) || (e.button == 2);
      e.pos = { x: 0, y: 0 };
      if (e.pageX || e.pageY) {
        e.pos.x = e.pageX;
        e.pos.y = e.pageY;
      } else if (e.clientX || e.clientY) {
        e.pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        e.pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      if ((overOut).test(type)) {
        e.relatedTarget = e.relatedTarget || e[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
      }
    }
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
    if (related == null) {
      return true;
    }
    if (!related) {
      return false;
    }
    return (related != this && related.prefix != 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related));
  }

  var customEvents = {
    mouseenter: {
      base: 'mouseover',
      condition: check
    },
    mouseleave: {
      base: 'mouseout',
      condition: check
    },
    mousewheel: {
      base: (navigator.userAgent.indexOf("Firefox") != -1) ? 'DOMMouseScroll' : 'mousewheel'
    }
  };

  var evnt = {
    add: add,
    remove: remove,
    clone: clone,
    fire: fire
  };

  var oldEvnt = context.evnt;
  evnt.noConflict = function () {
    context.evnt = oldEvnt;
    return this;
  };
  context.evnt = evnt;

}(this);