sink('add', function (test, ok) {

  test('add: should return the element passed in', 1, function () {
    var el = document.createElement('input');
    var returned = evnt.add(el, 'click', function () { });
    ok(el == returned, 'element equals returned value')
  });

  test('add: should be able to add single events', 1, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click', function () {ok(true, 'event was called')});
    Syn.click(el);
  });

  test('add: scope should be equal to element', 1, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click', function (e) {
      ok(this == el, 'listener was called with event')
    });
    Syn.click(el);
  });

  test('add: should recieve an event method', 1, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click', function (e) {
      ok(e != null, 'listener was called with event')
    });
    Syn.click(el);
  });

  test('add: should be able to pass x amounts of additional arguments', 4, function () {
    var el = document.createElement('input'),
        handler = function (e, foo, bar, baz) {
          ok(e != null, 'listener was called with event');
          ok(foo === 1, 'listener was called with correct argument');
          ok(bar === 2, 'listener was called with correct argument');
          ok(baz === 3, 'listener was called with correct argument');
        };

    evnt.add(el, 'click', handler, 1, 2, 3);
    Syn.click(el);
  });

  test('add: should be able to add multiple events by space seperating them', 2, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click keypress', function () {ok(true, 'event was called')});
    Syn.click(el).key('j');
  });

  test('add: should add same event only one time', 1, function () {
    var el = document.createElement('input');
    var handler = function () {ok(true, 'event was called one time')};
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    Syn.click(el);
  });

  test('add: should be able to add multiple events of the same type', 3, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click', function () {ok(true, 'event was called')});
    evnt.add(el, 'click', function () {ok(true, 'event was called')});
    evnt.add(el, 'click', function () {ok(true, 'event was called')});
    Syn.click(el);
  });

  test('add: should be able to add multiple events simultaneously with an object literal', 2, function () {
    var el = document.createElement('input');
    evnt.add(el, {
      click: function () {
        ok(true, 'click was called');
      },
      keydown: function () {
        ok(true, 'keydown was called');
      }
    });
    Syn.click(el).key('j');
  });

  test('remove: should return the element passed in', 1, function () {
    var el = document.createElement('input'),
        handler = function () {};
    evnt.add(el, 'click', handler);
    var returned = evnt.remove(el, 'click', handler);
    ok(el == returned, 'element equals returned value');
  });

  test('remove: should be able to remove a single event', 1, function () {
    var el = document.createElement('input'),
        handler = function () {
          ok(true, 'element has a class');
          evnt.remove(el, 'click', handler);
          Syn.click(el);
        }
    evnt.add(el, 'click', handler);
    Syn.click(el)
  });

  test('remove: should be able to remove mulitple events with an object literal', 1, function () {
    var el = document.createElement('input'),
        handler1 = function () {
          ok(true, 'element has a class');
          evnt.remove(el, {
            click: handler1,
            keydown: handler2
          });
          Syn.click(el).key('j');
        },
        handler2 = function () {
          ok(true, 'element has a class');
        };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'keydown', handler2);
    Syn.click(el);
  });

  test('remove: should be able to remove all events of a specific type', 1, function () {
    var el = document.createElement('input'),
      handler1 = function () {
        ok(true, 'element has a class');
        evnt.remove(el, 'click');
        Syn.click(el);
      },
      handler2 = function () {
        ok(true, 'element has a class');
      };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'click', handler2);
    Syn.click(el);
  });

  test('remove: should be able to remove all events', 1, function () {
    var el = document.createElement('input'),
        handler1 = function () {
          ok(true, 'element has a class');
          evnt.remove(el);
          Syn.click(el).key('j');
        },
        handler2 = function () {
          ok(true, 'element has a class');
        };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'keydown', handler2);
    Syn.click(el);
  });

  test('fire: should be able to fire an event', 1, function () {
    var el = document.createElement('input');
    evnt.add(el, 'click', function () {ok(true, 'event was called')});
    evnt.fire(el, 'click');
  });

  test('clone: should be able to clone events of a specific type from one element to another', 2, function () {
    var el1 = document.createElement('input');
    var el2 = document.createElement('input');
    evnt.add(el1, 'click', function () {ok(true, 'event was called')});
    evnt.add(el1, 'click', function () {ok(true, 'event was called')});
    evnt.add(el1, 'keydown', function () {ok(true, 'event was called')});
    evnt.clone(el2, el1, 'click');
    Syn.click(el2).key('j');
  });

  test('clone: should be able to clone all events from one element to another', 3, function () {
    var el1 = document.createElement('input');
    var el2 = document.createElement('input');
    evnt.add(el1, 'keypress', function () {ok(true, 'event was called')});
    evnt.add(el1, 'click', function () {ok(true, 'event was called')});
    evnt.add(el1, 'click', function () {ok(true, 'event was called')});
    evnt.clone(el2, el1);
    Syn.click(el2).key('j');
  });

});

start();