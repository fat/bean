# AS3 flavored Bean
A port of [Bean] with ActionScript (ECMASCript) flavored method names, instead of jQuery flavor. 

## Bean
Bean is a small, fast, cross-platform, framework-agnostic event manager designed for desktop, mobile, and touch-based browsers. In its simplest form - it works like this (well, it does in this port):

```js
bean.addEventListener(element, 'click', function (e) {
  console.log('hello');
});
```

## Mix-in

Ideally I guess I'd want to mix-in the bean with my objects, so that I could write real ActionScript style stuff, like

``` 
myObject.addEventListener('poo', bah)
```

I'm too lazy to try that now, since Bean looks really complicated.

## API

Bean has five main methods, each packing quite a punch.

  * <a href="#on">bean.<code>addEventListener()</code></a>
  * <a href="#one">bean.<code>one()</code></a>
  * <a href="#removeEventListener">bean.<code>removeEventListener()</code></a>
  * <a href="#clone">bean.<code>clone()</code></a>
  * <a href="#dispatchEvent">bean.<code>dispatchEvent()</code></a>

--------------------------------------------------------
<a name="on"></a>
### addEventListener(element, eventType[, selector], handler[, args ])
<code>bean.addEventListener()</code> lets you attach event listeners to both elements and objects.

**Arguments**

  * **element / object** (DOM Element or Object) - an HTML DOM element or any JavaScript Object
  * **event type(s)** (String) - an event (or multiple events, space separated) to listen to
  * **selector** (optional String) - a CSS DOM Element selector string to bind the listener to child elements matching the selector
  * **handler** (Function) - the callback function
  * **args** (optional) - additional arguments to pas to the callback function when triggered

Optionally, event types and handlers can be passed in an object of the form `{ 'eventType': handler }` as the second argument.

**Examples**

```js
// simple
bean.addEventListener(element, 'click', handler);

// optional arguments passed to handler
bean.addEventListener(element, 'click', functiaddEventListener(e, o1, o2) {
  console.log(o1, o2);
}, 'fat', 'ded');

// multiple events
bean.addEventListener(element, 'keydown keyup', handler);

// multiple handlers
bean.addEventListener(element, {
  click: function (e) {},
  mouseover: function (e) {},
  'focus blur': function (e) {}
});
```

**Delegation**

A String as the 3rd argument to `addEventListener()` will be interpreted as a selector for event delegation. Events for child elements will cause the element to be checked against the selector and the event to be fired if a match is found. The event behaves the same way as if you listened directly to the element it was fired on.

```js
// event delegated events
bean.addEventListener(element, 'click', '.content p', handler);

// Alternatively, you can pass an array of elements.
// This cuts down on selector engine work, and is a more performant means of
// delegation if you know your DOM won't be changing:
bean.addEventListener(element, [el, el2, el3], 'click', handler);
bean.addEventListener(element, $('.myClass'), 'click', handler);
```

**Notes**

 * Prior to v1, Bean used `add()` as its primary handler-adding interface, it still exists but uses the original argument order for delegated events: `add(element[, selector], eventType, handler[, args ])`. This may be removed in future versions of Bean.

 * The focus, blur, and submit events will not delegate due to [vagaries](http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html) of the DOM model. This *may* be addressed in a future version of Bean.

**Namespacing**

Bean supports namespacing your events. This makes it much easier to target the handlers later when using `removeEventListener()` or `dispatchEvent()`, both of these methods match namespaced handlers in the same way.

To namespace an event just add a dot followed by your unique name identifier:

```js
bean.addEventListener(element, 'click.fat.foo', fn);  // 1
bean.addEventListener(element, 'click.ded', fn);      // 2
bean.addEventListener(element, 'click', fn);          // 3

// later:
bean.dispatchEvent(element, 'click.ded');        // trigger 2
bean.dispatchEvent(element, 'click.fat');        // trigger 1
bean.removeEventListener(element, 'click');             // remove 1, 2 & 3

// dispatchEvent() & removeEventListener() match multiple namespaces with AND, not OR:
bean.dispatchEvent(element, 'click.fat.foo');    // trigger 1
bean.removeEventListener(element, 'click.fat.ded');     // remove nothing
```

**Notes**

 * Prior to v1, Bean matched multiple namespaces in `dispatchEvent()` and `remove()` calls using OR rather than AND.

--------------------------------------------------------
<a name="one"></a>
### one(element, eventType[, selector], handler[, args ])
<code>bean.addEventListenere()</code> is an alias for <code>bean.addEventListener()</code> except that the handler will only be executed once and then removed for the event type(s).

**Notes**

 * Prior to v1, `one()` used the same argument ordering as `add()` (see note above), it now uses the new `addEventListener()` ordering.

--------------------------------------------------------
<a name="removeEventListener"></a>
### removeEventListener(element[, eventType[, handler ]])
<code>bean.removeEventListener()</code> is how you get rid of handlers once you no longer want them active. It's also a good idea to call *removeEventListener* on elements before you remove them from your DOM; this gives Bean a chance to clean up some things and prevents memory leaks.

**Arguments**

  * **element / object** (DOM Element or Object) - an HTML DOM element or any JavaScript Object
  * **event type(s)** (optional String) - an event (or multiple events, space separated) to remove
  * **handler** (optional Function) - the specific callback function to remove

Optionally, event types and handlers can be passed in an object of the form `{ 'eventType': handler }` as the second argument, just like `addEventListener()`.

**Examples**

```js
// remove a single event handlers
bean.removeEventListener(element, 'click', handler);

// remove all click handlers
bean.removeEventListener(element, 'click');

// remove handler for all events
bean.removeEventListener(element, handler);

// remove multiple events
bean.removeEventListener(element, 'mousedown mouseup');

// remove all events
bean.removeEventListener(element);

// remove handlers for events using object literal
bean.removeEventListener(element, { click: clickHandler, keyup: keyupHandler })
```

**Notes**

 * Prior to Bean v1, `remove()` was the primary removal interface. This is retained as an alias for backward compatibility but may eventually be removed.

--------------------------------------------------------
<a name="clone"></a>
### clone(destElement, srcElement[, eventType ])
<code>bean.clone()</code> is a method for cloning events from one DOM element or object to another.

**Examples**

```js
// clone all events at once by doing this:
bean.clone(toElement, fromElement);

// clone events of a specific type
bean.clone(toElement, fromElement, 'click');
```

--------------------------------------------------------
<a name="dispatchEvent"></a>
### dispatchEvent(element, eventType[, args ])
<code>bean.dispatchEvent()</code> gives you the ability to trigger events.

**Examples**

```js
// dispatchEvent a single event on an element
bean.dispatchEvent(element, 'click');

// dispatchEvent multiple types
bean.dispatchEvent(element, 'mousedown mouseup');
```

**Notes**

 * An optional args array may be passed to `dispatchEvent()` which will in turn be passed to the event handlers. Handlers will be triggered manually, outside of the DOM, even if you're trying to dispatchEvent standard DOM events.


--------------------------------------------------------
<a name="setSelectorEngine"></a>
### setSelectorEngine(selectorEngine)
<code>bean.setSelectorEngine()</code> allows you to set a default selector engine for all your delegation needs.

The selector engine simply needs to be a function that takes two arguments: a selector string and a root element, it should return an array of matched DOM elements. [Qwery](https://github.com/ded/qwery), [Sel](https://github.com/amccollum/sel), [Sizzle](https://github.com/jquery/sizzle), [NWMatcher](https://github.com/dperini/nwmatcher) and other selector engines should all be compatible with Bean.

**Examples**

```js
bean.setSelectorEngine(qwery);
```

**Notes**

 * `querySelectorAll()` is used as the default selector engine, this is available on most modern platforms such as mobile WebKit. To support event delegation on older browsers you will need to install a selector engine.

## The `Event` object

Bean implements a variant of the standard DOM `Event` object, supplied as the argument to your DOM event handler functions. Bean wraps and *fixes* the native `Event` object where required, providing a consistent interface across browsers.

```js
// prevent default behavior and propagation (even works on old IE)
bean.addEventListener(el, 'click', function (event) {
  event.preventDefault();
  event.stopPropagatiaddEventListener();
});

// a simple shortcut version of the above code
bean.addEventListener(el, 'click', function (event) {
  event.stop();
});

// prevent all subsequent handlers from being triggered for this particular event
bean.addEventListener(el, 'click', function (event) {
  event.stopImmediatePropagatiaddEventListener();
});
```

**Notes**

 * Your mileage with the `Event` methods (`preventDefault` etc.) may vary with delegated events as the events are not intercepted at the element in question.

## Custom events

Bean uses methods similar to [Dean Edwards' event model](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) to ensure custom events behave like real events, rather than just callbacks.

For all intents and purposes, you can just think of them as native DOM events, which will bubble up and behave you would expect.

**Examples**

```js
bean.addEventListener(element, 'partytime', handler);
bean.dispatchEvent(element, 'partytime');
```

## mouseenter, mouseleave

Bean provides you with two custom DOM events, *'mouseenter'* and *'mouseleave'*. They are essentially just helpers for making your mouseover / mouseout lives a bit easier.

**Examples**

```js
bean.addEventListener(element, 'mouseenter', enterHandler);
bean.addEventListener(element, 'mouseleave', leaveHandler);
```

## Object support

Everything you can do in Bean with an element, you can also do with an object. This is particularly useful for working with classes or plugins.

```js
var inst = new Klass();
bean.addEventListener(inst, 'complete', handler);

//later on...
bean.dispatchEvent(inst, 'complete');
```

## Licence & copyright

Bean is copyright &copy; 2011-2012 Jacob Thornton and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
