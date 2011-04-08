//mocking
function mockAddEventType (ok, element, okType, okHandler) {
  if (element.addEventListener) {
    var org = element.addEventListener;
	  element.addEventListener = function (type, handler) {
	    if (type == okType) {
	      ok(type == okType, 'passed correct type');
  	    handler.call(element, {type: type});
	    } else {
	      org.apply(this, arguments);
      }
	  }
	} else {
	  var org = element.attachEvent;
	  element.attachEvent = function (type, handler) {
	    if (type == okType) {
  	    ok(type == 'on' + okType, 'passed correct type');
  	    handler.call(element, {type: type});
	    } else {
	      org.apply(this, arguments);
      }
	  }
	}
}

function mockRemoveEventType (ok, element, okType, okHandler) {
  if (element.removeEventListener) {
    var org = element.removeEventListener;
	  element.removeEventListener = function (type, handler) {
	    if (type == okType) {
	      ok(type == okType, 'passed correct type');
	    } else {
	      org.apply(this, arguments);
      }
	  }
	} else {
	  var org = element.detachEvent;
	  element.detachEvent = function (type, handler) {
	    if (type == okType) {
  	    ok(type == 'on' + okType, 'passed correct type');
	    } else {
	      org.apply(this, arguments);
      }
	  }
	}
}

sink('addEvent::nativeEvents', function (test, ok) {

  test('addEvent: adding an event should return the element passed in', 1, function () {
    var el = document.createElement('div');
    var returned = evnt.add(el, 'click', function () { });
    ok(el == returned, 'element equals returned value')
  });

  test('addEvent: adding an event should add an event to the element passed in', 2, function () {
    var el = document.createElement('div');
    var handler = function () {
      ok(true, 'handler was called');
    };
    mockAddEventType(ok, el, 'click', handler)
    evnt.add(el, 'click', handler);
  });

  test('addEvent: adding the same event multiple times should only add it 1 time', 2, function () {
    var el = document.createElement('div');
    var handler = function () {
      ok(true, 'handler was called');
    };
    mockAddEventType(ok, el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler);
  });

  test('addEvent: triggering an event should fire callback in added event', 1, function () {
    var el = document.createElement('div');
    var handler = function () {
      ok(true, 'handler was called');
    };
    evnt.add(el, 'click', handler);
    evnt.fire(el, 'click');
  });

});

sink('addEvents', function (test, ok) {

  test('addEvents: should return element', 1, function () {
    var el = document.createElement('div');
    var handler1 = function () {};
    var obj = {click: handler1}
    ok(evnt.add(el, obj) == el, 'addEvents return element');
  });

  test('addEvents: should call add event for each item passed in object', 4, function () {
    var el = document.createElement('div');
    var handler1 = function () {
      ok(true, 'handler1 was called');
    };
    var handler2 = function () {
      ok(true, 'handler2 was called');
    };
    var obj = {
      click: handler1,
      mouseover: handler2
    }
    mockAddEventType(ok, el, 'click', handler1);
    mockAddEventType(ok, el, 'mouseover', handler2);
    evnt.add(el, obj);
  });

});

sink('removeEvent', function (test, ok) {

  test('removeEvent: should call remove event with correct handler and type', 1, function () {
    var el = document.createElement('div');
    var handler = function () {};
    mockRemoveEventType(ok, el, 'click', handler);
    evnt.add(el, 'click', handler);
    evnt.remove(el, 'click', handler);
  });

});

sink('removeEvents', function (test, ok) {

  test('removeEvents: should remove all events when noarguments are supplied', 3, function () {
    var el = document.createElement('div');

    var handler = function () {};
    var handler2 = function () {};
    var handler3 = function () {};

    mockRemoveEventType(ok, el, 'click', handler);
    mockRemoveEventType(ok, el, 'click', handler2);
    mockRemoveEventType(ok, el, 'mouseover', handler3);

    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler2);
    evnt.add(el, 'mouseover', handler3);
    evnt.remove(el);
  });

  test('removeEvents: should remove all events of a type when type is supplied', 2, function () {
    var el = document.createElement('div');

    var handler = function () {};
    var handler2 = function () {};
    var handler3 = function () {};

    mockRemoveEventType(ok, el, 'click', handler);
    mockRemoveEventType(ok, el, 'click', handler2);
    mockRemoveEventType(ok, el, 'mouseover', handler3);

    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler2);
    evnt.add(el, 'mouseover', handler3);

    evnt.remove(el, 'click');
  });

  test('removeEvents: should remove all events in object when obj is supplied', 1, function () {
    var el = document.createElement('div');

    var handler = function () {};
    var handler2 = function () {};
    var obj = { click: handler };

    mockRemoveEventType(ok, el, 'click', handler);
    mockRemoveEventType(ok, el, 'click', handler2);

    evnt.add(el, 'click', handler);
    evnt.add(el, 'click', handler2);
    evnt.remove(el, obj);
  });

});

sink('cloneEvents', function (test, ok) {
  test('cloneEvents: should clone all events from one element to another', 2, function () {
    var el1 = document.createElement('div');
    var el2 = document.createElement('div');
    var handler = function () {
      ok(true, 'handler was called');
    };
    evnt.add(el1, 'click', handler);
    mockAddEventType(ok, el2, 'click', handler);
    evnt.clone(el2, el1);
  });
});

sink('fireEvent', function (test, ok) {
  test('fireEvent: should fire all handlers of supplied type', 3, function () {
    var el = document.createElement('div');
    var handler1 = function () { ok(true, 'handler was called'); };
    var handler2 = function () { ok(true, 'handler was called'); };
    var handler3 = function () { ok(true, 'handler was called'); };
    evnt.add(el, 'click', handler1);
    evnt.add(el, 'click', handler2);
    evnt.add(el, 'click', handler3);
    evnt.fire(el, 'click');
  });
});

start();