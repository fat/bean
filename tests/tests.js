//stub this for ie crap
if (!window.console) {
  window.console = { log: function () {}}
}

sink('add', function (test, ok) {

  test('add: should return the element passed in', 1, function () {
    var el = document.getElementById('input');
    var returned = evnt.add(el, 'click', function () {});
    ok(el == returned, 'returns the element passed in');
    evnt.remove(el);
  });

  test('add: should be able to add single events to elements', 1, function () {
    var el = document.getElementById('input');
    evnt.add(el, 'click', function () {
      evnt.remove(el);
      ok(true, 'adds single events to elements');
    });
    Syn.click(el);
  });

  test('add: should be able to add single events to objects', 1, function () {
    var obj = {};
    evnt.add(obj, 'complete', function () {
      ok(true, 'adds single events to objects');
    });
    evnt.fire(obj, 'complete');
    evnt.remove(obj);
    evnt.fire(obj, 'complete');
  });

  test('add: scope should be equal to element', 1, function () {
    var el = document.getElementById('input');
    evnt.add(el, 'click', function (e) {
      evnt.remove(el);
      ok(this == el, 'equal to element')
    });
    Syn.click(el);
  });

  test('add: should recieve an event method', 1, function () {
    var el = document.getElementById('input');
    evnt.add(el, 'click', function (e) {
      evnt.remove(el);
      ok(e != null, 'recieves an event method')
    });
    Syn.click(el);
  });

  test('add: should be able to pass x amount of additional arguments', 4, function () {
    var el = document.getElementById('input');
        handler = function (e, foo, bar, baz) {
          evnt.remove(el);
          ok(e != null, 'listener was called with event');
          ok(foo === 1, 'listener was called with correct argument');
          ok(bar === 2, 'listener was called with correct argument');
          ok(baz === 3, 'listener was called with correct argument');
        };
    evnt.add(el, 'click', handler, 1, 2, 3);
    Syn.click(el);
  });

  test('add: should be able to add multiple events by space seperating them', 2, function () {
    var el = document.getElementById('input');
    evnt.add(el, 'click keypress', function () {
      ok(true, 'adds multiple events by space seperating them');
    });
    Syn.click(el).key('j');
  });

  test('add: should add same event only one time', 1, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    var handler = function () {ok(true, 'adds same event only one time')};
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    Syn.click(el);
  });

  test('add: should be able to add multiple events of the same type', 3, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    evnt.add(el, 'click', function () {ok(true, 'adds multiple events of the same type 1')});
    evnt.add(el, 'click', function () {ok(true, 'adds multiple events of the same type 2')});
    evnt.add(el, 'click', function () {ok(true, 'adds multiple events of the same type 3')});
    Syn.click(el);
  });

  test('add: should be able to add multiple events simultaneously with an object literal', 2, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    evnt.add(el, {
      click: function () {
        ok(true, 'adds multiple events simultaneously with an object literal 1');
      },
      keydown: function () {
        ok(true, 'adds multiple events simultaneously with an object literal 2');
        evnt.remove(el);
      }
    });
    Syn.click(el).key('j');
  });

  test('add: should bubble up dom', 1, function () {
    var el1 = document.getElementById('foo');
    var el2 = document.getElementById('bar');
    evnt.add(el1, 'click', function () {ok(true, 'bubbles up dom')});
    Syn.click(el2);
  });

  test('fire: should be able to fire an event', 1, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    evnt.add(el, 'click', function () {ok(true, 'fires an event')});
    evnt.fire(el, 'click');
  });

  test('fire: should be able to fire multiple events by space seperation', 2, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    evnt.add(el, 'mousedown', function () {ok(true, 'fires multiple events by space seperation 1')});
    evnt.add(el, 'mouseup', function () {ok(true, 'fires multiple events by space seperation 2')});
    evnt.fire(el, 'mousedown mouseup');
  });

  test('custom: should be able to add single custom events', 1, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    evnt.add(el, 'partytime', function () {ok(true, 'add single custom events')});
    evnt.fire(el, 'partytime');
  });

  test('custom: should bubble up dom like traditional events', 1, function () {
    if (!window.addEventListener) {
      //dean edwards onpropertychange hack doesn't bubble unfortunately :(
      return ok(true, 'internet explorer is not a bubler, turns out.')
    }
    var el1 = document.getElementById('foo');
    var el2 = document.getElementById('bar');
    evnt.add(el1, 'partytime', function () {ok(true, 'bubbles up dom like traditional events')});
    evnt.fire(el2, 'partytime');
  });

  test('event: should have correct target', 1, function () {
    var el1 = document.getElementById('foo');
    var el2 = document.getElementById('bar');
    evnt.remove(el1, 'click');
    evnt.add(el1, 'click', function (e) {ok(e.target == el2, 'has correct target')});
    Syn.click(el2);
  });

  test('event: should have stop propagation method', 1, function () {
    var el = document.getElementById('foo');
    evnt.remove(el);
    evnt.add(el, 'click', function (e) {ok(e.stopPropagation != null, 'has stop propagation')});
    Syn.click(el);
  });

  test('event: should have preventDefault method', 1, function () {
    var el = document.getElementById('foo');
    evnt.remove(el);
    evnt.add(el, 'click', function (e) {ok(e.preventDefault != null, 'has prevent default method')});
    Syn.click(el);
  });

  test('event: should have keyCode', 1, function () {
    var el = document.getElementById('input');
    evnt.add(el, 'keypress', function (e) {
      evnt.remove(el);
      ok(e.keyCode != null, 'has keycode');
    });
    Syn.key(el, 'f');
  });

  test('remove: should return the element passed in', 1, function () {
    var el = document.getElementById('foo');
    evnt.remove(el);
    var handler = function () {};
    evnt.add(el, 'click', handler);
    var returned = evnt.remove(el, 'click', handler);
    ok(el == returned, 'returns the element passed in');
  });

  test('remove: should be able to remove a single event', 1, function () {
    var el = document.getElementById('foo');
    evnt.remove(el);
    var handler = function () {
      ok(true, 'remove a single event');
      evnt.remove(el, 'click', handler);
      Syn.click(el);
    }
    evnt.add(el, 'click', handler);
    Syn.click(el)
  });

  test('remove: should be able to remove mulitple events with an object literal', 1, function () {
    var el = document.getElementById('input'),
        handler1 = function () {
          ok(true, 'remove mulitple events with an object literal1');
          evnt.remove(el, {
            click: handler1,
            keydown: handler2
          });
          Syn.click(el).key('j');
        },
        handler2 = function () {
          ok(true, 'remove mulitple events with an object literal2');
        };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'keydown', handler2);
    Syn.click(el);
  });

  test('remove: should be able to remove all events of a specific type', 2, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    var handler1 = function () {
        ok(true, 'removes all events of a specific type 1');
        evnt.remove(el, 'click');
        Syn.click(el);
      },
      handler2 = function () {
        ok(true, 'removes all events of a specific type 2');
      };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'click', handler2);
    Syn.click(el);
  });

  test('remove: should be able to remove all events of a specific type', 2, function () {
    var el = document.getElementById('input');
    evnt.remove(el);
    var handler1 = function () {
        ok(true, 'removes all events of a specific type 1');
      },
      handler2 = function () {
        ok(true, 'remove all events of a specific type 2');
        evnt.remove(el, 'mousedown mouseup');
        Syn.click(el);
      };
    evnt.add(el, 'mousedown', handler1);
    evnt.add(el, 'mouseup', handler2);
    Syn.click(el);
  });

  test('remove: should be able to remove all events', 1, function () {
    var el = document.getElementById('input'),
        handler1 = function () {
          ok(true, 'remove all events 1');
          evnt.remove(el);
          Syn.click(el).key('j');
        },
        handler2 = function () {
          ok(true, 'remove all events 2');
        };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'keydown', handler2);
    Syn.click(el);
  });

  test('clone: should be able to clone events of a specific type from one element to another', 2, function () {
    var el1 = document.getElementById('input2');
    var el2 = document.getElementById('input');
    evnt.remove(el1);
    evnt.remove(el2);
    evnt.add(el1, 'click', function () {ok(true, 'clones events of a specific type from one element to another 1')});
    evnt.add(el1, 'click', function () {
      ok(true, 'clone events of a specific type from one element to another 2');
      evnt.remove(el2);
    });
    evnt.add(el1, 'keydown', function () {
      ok(true, 'clone events of a specific type from one element to another 3');
      evnt.remove(el2);
    });
    evnt.clone(el2, el1, 'click');
    Syn.click(el2).key('j');
  });

  test('clone: should be able to clone all events from one element to another', 3, function () {
    var el1 = document.getElementById('input2');
    var el2 = document.getElementById('input');
    evnt.remove(el1);
    evnt.remove(el2);
    evnt.add(el1, 'keypress', function () {ok(true, 'clones all events from one element to another 1');});
    evnt.add(el1, 'click', function () {ok(true, 'clones all events from one element to another 2');});
    evnt.add(el1, 'click', function () {ok(true, 'clonesall events from one element to another 3');});
    evnt.clone(el2, el1);
    Syn.click(el2).key('j');
  });

  test('delegate: should be able to delegate on selectors', 4, function () {
    var el1 = document.getElementById('foo');
    var el2 = document.getElementById('bar');
    var el3 = document.getElementById('baz');
    var el4 = document.getElementById('bang');
    evnt.remove(el1);
    evnt.remove(el2);
    evnt.remove(el3);
    evnt.add(el1, '.bar', 'click', function () {
      ok(true, 'delegation on selectors 1');
      ok(this == el2, 'delegation on selectors, context was set to delegated element 2');
    }, qwery);
    Syn.click(el2);
    Syn.click(el3);
    Syn.click(el4);
  });

  test('delegate: should be able to delegate on arary', 4, function () {
    var el1 = document.getElementById('foo');
    var el2 = document.getElementById('bar');
    var el3 = document.getElementById('baz');
    var el4 = document.getElementById('bang');
    evnt.remove(el1);
    evnt.remove(el2);
    evnt.remove(el3);
    evnt.add(el1, [el2], 'click', function () {
      ok(true, 'delegation on arary 1');
      ok(this == el2, 'delegation on arary, context was set to delegated element 1');
    }, qwery);
    Syn.click(el2);
    Syn.click(el3);
    Syn.click(el4);
  });

});

window.onload = start;