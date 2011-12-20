/*global module:true, define:true*/
!function (name, definition) {
  if (typeof module !== 'undefined') module.exports = definition()
  else if (typeof define === 'function' && typeof define.amd === 'object') define(definition)
  else this[name] = definition()
}('bean', function () {
  var context = this
    , old = this.bean
    , win = window
    , overOut = /over|out/
    , namespace = /[^\.]*(?=\..*)\.|.*/
    , stripName = /\..*/
    , addEvent = 'addEventListener'
    , attachEvent = 'attachEvent'
    , removeEvent = 'removeEventListener'
    , detachEvent = 'detachEvent'
    , doc = document || {}
    , root = doc.documentElement || {}
    , W3C_MODEL = root[addEvent]
    , eventSupport = W3C_MODEL ? addEvent : attachEvent
    , slice = Array.prototype.slice
    , ONE = {one:1} // singleton for quick matching making add() do one()

    , nativeEvents = {
          click: 1, dblclick: 1, mouseup: 1, mousedown: 1, contextmenu: 1 //mouse buttons
        , mousewheel: 1, DOMMouseScroll: 1 //mouse wheel
        , mouseover: 1, mouseout: 1, mousemove: 1, selectstart: 1, selectend: 1 //mouse movement
        , keydown: 1, keypress: 1, keyup: 1 //keyboard
        , orientationchange: 1 // mobile
        , touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1 // touch
        , gesturestart: 1, gesturechange: 1, gestureend: 1 // gesture
        , focus: 1, blur: 1, change: 1, reset: 1, select: 1, submit: 1 //form elements
        , load: 1, unload: 1, beforeunload: 1, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1 //window
        , error: 1, abort: 1, scroll: 1 //misc
      }

    , customEvents = (function () {
        function isDescendant(parent, node) {
          while ((node = node.parentNode) !== null) {
            if (node === parent) return true
          }
          return false
        }

        function check(event) {
          var related = event.relatedTarget
          if (!related) return related === null
          return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related))
        }

        return {
            mouseenter: { base: 'mouseover', condition: check }
          , mouseleave: { base: 'mouseout', condition: check }
          , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
        }
      })()

    , fixEvent = (function () {
        // thanks to jQuery for this basis of this list, helps avoid copying more than we need to
        // from native events
        var commonProps = 'attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' ')
          , mouseProps = commonProps.concat('button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
          , keyProps = commonProps.concat('char charCode key keyCode'.split(' '))
          , preventDefault = function (e) {
              return function () {
                if (e.preventDefault)
                  e.preventDefault()
                else
                  e.returnValue = false
              }
            }
          , stopPropagation = function (e) {
              return function () {
                if (e.stopPropagation)
                  e.stopPropagation()
                else
                  e.cancelBubble = true
              }
            }
          , copyProps = function(result, event, props) {
              var i, p
              for (i = props.length; i--;) {
                p = props[i]
                if (!(p in result) && p in event) result[p] = event[p]
              }
            }

        return function (event, isNative) {
          var result = { originalEvent: event }
          if (!event)
            return result

          var props
            , type = event.type
            , target = event.target || event.srcElement

          result.preventDefault = preventDefault(event)
          result.stopPropagation = stopPropagation(event)
          result.target = target && target.nodeType === 3 ? target.parentNode : target

          if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
            if (~type.indexOf('key')) {
              props = keyProps
              result.keyCode = event.which || event.keyCode
            } else if ((/click|mouse|menu/i).test(type)) {
              props = mouseProps
              result.rightClick = event.which === 3 || event.button === 2
              result.pos = { x: 0, y: 0 }
              if (event.pageX || event.pageY) {
                result.clientX = event.pageX
                result.clientY = event.pageY
              } else if (event.clientX || event.clientY) {
                result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
              }
              if (overOut.test(type))
                result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
            }
            copyProps(event, result, props || commonProps)
          }
          return result
        }
      })()

      // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
    , targetElement = function (element, isNative) {
        return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
      }

      // we use one of these per listener, of any type
    , RegEntry = (function () {
        function entry (element, type, handler, original, namespaces) {
          this.element = element
          this.type = type
          this.handler = handler
          this.original = original
          this.namespaces = namespaces
          this.custom = customEvents[type]
          this.isNative = nativeEvents[type] && element[eventSupport]
          this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange'
          this.customType = !W3C_MODEL && !this.isNative && type
          this.target = targetElement(element, this.isNative)
          this.eventSupport = this.target[eventSupport]
        }

        // given a list of namespaces, is our entry in any of them?
        entry.prototype.inNamespaces = function (checkNamespaces) {
          var i, j
          if (!checkNamespaces)
            return true
          if (!this.namespaces)
            return false
          for (i = checkNamespaces.length; i--;) {
            for (j = this.namespaces.length; j--;) {
               if (checkNamespaces[i] === this.namespaces[j])
                return true
            }
          }
          return false
        }

        // match by element, original fn (opt), handler fn (opt)
        entry.prototype.matches = function (checkElement, checkOriginal, checkHandler) {
          return this.element === checkElement &&
            (!checkOriginal || this.original === checkOriginal) &&
            (!checkHandler || this.handler === checkHandler)
        }

        return entry
      })()

    , registry = (function () {
        // our map stores arrays by event type, just because it's better than storing
        // everything in a single array
        var map = {}

          // generic functional search of our registry for matching listeners,
          // `fn` returns false to break out of the loop
          , forAll = function (element, type, original, handler, fn) {
              if (!type || type === '*') {
                // search the whole registry
                for (var t in map) {
                  if (map.hasOwnProperty(t))
                    forAll(element, t, original, handler, fn)
                }
              } else {
                var i = 0, l, list = map[type], all = element === '*'
                if (!list)
                  return
                for (l = list.length; i < l; i++) {
                  if (all || list[i].matches(element, original, handler))
                    if (!fn(list[i], list, i, type))
                      return
                }
              }
            }

          , has = function (element, type, original) {
              // we're not using forAll here simply because it's a bit slower and this
              // needs to be fast
              var i, list = map[type]
              if (list) {
                for (i = list.length; i--;) {
                  if (list[i].matches(element, original, null))
                    return true
                }
              }
              return false
            }

          , get = function (element, type, original) {
              var entries = []
              forAll(element, type, original, null, function (entry) { return entries.push(entry) })
              return entries
            }

          , put = function (entry) {
              (map[entry.type] || (map[entry.type] = [])).push(entry)
              return entry
            }

          , del = function (entry) {
              forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                list.splice(i, 1)
                return false
              })
            }

            // dump all entries, used for onunload
          , entries = function () {
              var t, entries = []
              for (t in map) {
                if (map.hasOwnProperty(t))
                  entries = entries.concat(map[t])
              }
              return entries
            }
            // probably temporary, not for production release
          , size = function () {
              var c = 0
              forAll('*', '*', null, null, function () { c++ })
              return c
            }

          return { has: has, get: get, put: put, del: del, entries: entries, size: size }
        })()

        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }

      , nativeHandler = function (element, fn, args) {
          return function (event) {
            event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true)
            return fn.apply(element, [event].concat(args))
          }
        }

      , customHandler = function (element, fn, type, condition, args, isNative) {
          return function (event) {
            if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event)
                event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative)
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
        }

      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }

      , removeListener = function (element, orgType, handler, names) {
          var i, l, entry
            , type = (orgType && orgType.replace(stripName, ''))
            , handlers = registry.get(element, type, handler)

          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(names)) {
              if ((entry = handlers[i]).eventSupport)
                listener(entry.target, entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }

      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(stripName, '')
            , namespaces = orgType.replace(namespace, '').split('.')

          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            fn = customEvents[type].condition ? customHandler(element, fn, type, customEvents[type].condition, true) : fn
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry.eventSupport)
            listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
        }

      , del = function (selector, fn, $) {
          return function (e) {
            var target, i, array = typeof selector === 'string' ? $(selector, this) : selector
            for (target = e.target; target && target !== this; target = target.parentNode) {
              for (i = array.length; i--;) {
                if (array[i] === target) {
                  return fn.apply(target, arguments)
                }
              }
            }
          }
        }

      , remove = function (element, orgEvents, fn) {
          var k, m, type, events, i, names
            , rm = removeListener
            , isString = orgEvents && typeof orgEvents === 'string'

          if (isString && orgEvents.indexOf(' ') > 0) {
            orgEvents = orgEvents.split(' ')
            for (i = orgEvents.length; i-- && remove(element, orgEvents[i], fn);) {}
            return element
          }
          events = isString ? orgEvents.replace(stripName, '') : orgEvents
          if (fn && typeof fn === 'function') {
            rm(element, events, fn)
          } else {
            if (names = isString && orgEvents.replace(namespace, ''))
              names = names.split('.')
            rm(element, type, null, names)
          }
          return element
        }

      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'

          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }

      , one = function () {
          return add.apply(ONE, arguments)
        }

      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }

      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')

          for (i = types.length; i--;) {
            type = types[i].replace(stripName, '')
            if (names = types[i].replace(namespace, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }

      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length

          for (;i < l; i++)
            handlers[i].original && add(element, handlers[i].type, handlers[i].original)
          return element
        }

      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , noConflict: function () {
              context.bean = old
              return this
            }
        }

  if (win[attachEvent]) {
    // for IE, clean up on unload to avoid leaks
    var cleanup = function () {
      var i
        , entries = registry.entries()

      for (i in entries) {
        if (entries[i].type && entries[i].type !== 'unload')
          remove(entries[i].element, entries[i].type)
      }
      win[detachEvent]('onunload', cleanup)
      win.CollectGarbage && win.CollectGarbage()
    }
    win[attachEvent]('onunload', cleanup)
  }

  return bean
})
