Bean - Just events.
------------------

Bean is an event api. It's pretty awesome.

add
---
You can add events one at a time, like this:

    evnt.add(element, 'click', handler});

Or you can pass entire objects:

    evnt.add(element, {
      click: function (e) {
        // codez
      },
      mouseover: function (e) {
        // codez
      }
    });

it even supports delegation:

    evnt.add(element, '.myClass', handler, qwery)

remove
------
You can remove single event handlers, like this:

    evnt.remove(element, 'click', handler);

Or remove all click events for a particular element:

    evnt.remove(element, 'click');

Or remove all events for the entire element:

    evnt.remove(element);

clone
-----
You can clone events from one element to another:

    evnt.clone(toElement, fromElement, optionalType);

fire
----
You can fire events at anytime:

    evnt.fire(element, 'click');

custom events
-------------
Custom events use Dean Edward's event model outlined (here)[http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/].

You can you use them like you would any other events:

    evnt.add(el, 'partytime', handler);
    evnt.fire(el, 'partytime');


There are three custom events already provided for you... these include mouseenter, mouseleave, and mousewheel.

Browser Support
---------------
  - IE6, IE7, IE8, IE9
  - Chrome 1 - 10
  - Safari 3, 4, 5
  - Firefox 2, 3, 4

Build
-----
Evnt uses [JSHint](http://www.jshint.com/) to keep some house rules as well as [UglifyJS](https://github.com/mishoo/UglifyJS) for its compression. For those interested in building Bean yourself. Run *make* in the root of the project.

Tests
-----
point your browser at _bean/tests/index.html_

Contributors
-------
  * [Dustin Diaz](https://github.com/ded/qwery/commits/master?author=ded)
  * [Jacob Thornton](https://github.com/ded/qwery/commits/master?author=fat)
  * Follow our software [@dedfat](http://twitter.com/dedfat)