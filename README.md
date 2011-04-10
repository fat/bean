Bean - Just events.
-------------------
Bean is a simple, new module which aims to give you all the power you've come to expect from larger libraries event systems, but in the tiniest package evar... only 2k gzipped!

add
---
As you might expect, the add method is going to enable you to add all your event handlers. What you might not expect, is that it is crazy flexible -- adding native or custom events, to elements or objects is not a problem.

Let's start with the simplest example, adding a click event to an element:

    evnt.add(element, 'click', handler);

If you'd like, you can also include additional arguments which will be passed back to your handlers at event execution:

    evnt.add(element, 'click', function(e, foo, bar) {
      //codez
    }, 'fat', 'ded');

Also (like with jquery), you can specify multiple event types in one declaration:

    evnt.add(element, 'keydown keyup', handler);

You might also want to pass an object with a handful of event types and handlers:

    evnt.add(element, {
      click: function (e) {},
      mouseover: function (e) {},
      'focus blur': function (e) {}
    });

Or maybe you're into using event delegation:

    evnt.add(element, '.myClass', 'click', handler, $);

*(note: to use event delegation with a selector, you must pass bean.Add a reference to a selector engine like qwery or sizzle)*

Or alternatively, you can pass an array of elements (this actually cuts down on selector engine work, and is more performant means of delegation if you know your DOM won't be changing.

    evnt.add(element, [el, el2, el3], 'click', handler);

    //or

    evnt.add(element, $('.myClass'), 'click', handler);

*(note: We haven't yet implemented focus, blur, submit delegation... if this is a deal breaker for you, pls let us know!)*

remove
------
Remove is how you get rid of listeners once you know longer want them. It's also a good idea to call remove on elements before you remove elements from your dom (this gives bean a chance to clean up some things.)

To remove single event handlers, do something like this:

    evnt.remove(element, 'click', handler);

Or, you can also remove all click handlers for a particular element:

    evnt.remove(element, 'click');

Or remove multiple event types at once like this:

    evnt.remove(element, 'mousedown mouseup');

Or remove all events for the element at once like this:

    evnt.remove(element);

clone
-----
Clone is beans method for cloning events from one element to another.

You can clone all events at once by doing this:

    evnt.clone(toElement, fromElement);

Or, if you prefer, you can just clone events of a specific type by specifying something like this:

    evnt.clone(toElement, fromElement, 'click');

fire
----
Use fire to trigger events.

You can fire events at anytime by doing this:

    evnt.fire(element, 'click');

Also, you can specify multiple types at once like this:

    evnt.fire(element, 'mousedown mouseup');

custom events
-------------
Bean uses methods similar to Dean Edward's event model outlined (here)[http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/] to ensure they behave like real events, rather than just callbacks.

For all intents and purposes, you can just think of them as native events, which will bubble up, and everything...

use them like this:

    evnt.add(element, 'partytime', handler);
    evnt.fire(element, 'partytime');

mouseenter, mouseleave
----------------------
Bean provides you with two special events, mouseenter and mouseleave. They are essentially just helpers for making your mouseover/mouseout lives a bit easier.

use them like regular events:

    evnt.add(element, 'mouseenter', handler);


object support
--------------
Good news, everything you can do in bean with an element, you can also do with an object! This is particularly useful for working with classes or plugins.

    var klass = new Klass();
    evnt.add(klass, 'complete', handler);
    //later on...
    evnt.fire(klass, 'complete');

Browser Support
---------------
Bean has been hand tested in these browsers... and we can personally vouch for them passing all tests. If you've found bugs in these browsers or others please let us know!!

  - IE6, IE7, IE8, IE9
  - Chrome 10
  - Safari 5
  - Firefox 3, 4

Build
-----
Bean uses [JSHint](http://www.jshint.com/) to keep some house rules as well as [UglifyJS](https://github.com/mishoo/UglifyJS) for its compression. For those interested in building Bean yourself. Run *make* in the root of the project.

Tests
-----
point your browser at _bean/tests/index.html_ ... We use syn for firing events in our unit tests.

Contributors
-------
  * [Dustin Diaz](https://github.com/ded/qwery/commits/master?author=ded)
  * [Jacob Thornton](https://github.com/ded/qwery/commits/master?author=fat)
  * Follow our software [@dedfat](http://twitter.com/dedfat)