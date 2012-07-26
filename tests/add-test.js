/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('add', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should return the element passed in': function () {
      var el       = this.byId('input')
        , returned = bean.add(el, 'click', function () {})

      assert.same(el, returned, 'returns the element passed in')
    }

  , 'should be able to add single events to elements': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'click', spy)

      Syn.click(el)

      defer(function() {
        assert(spy.calledOnce, 'adds single events to elements ')
        done()
      })
    }

  , 'should be able to add single events to objects': function (done) {
      var obj = this.newObj()
        , spy = this.spy()

      bean.add(obj, 'complete', spy)
      bean.fire(obj, 'complete')
      bean.remove(obj)
      bean.fire(obj, 'complete')

      defer(function () {
        assert(spy.calledOnce, 'adds single events to objects')
        done()
      })
    }

  , 'scope should be equal to element': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'click', spy)

      Syn.click(el)

      defer(function () {
        assert(spy.calledOnce, 'single call')
        assert(spy.calledOn(el), 'called with element as scope (this)')
        done()
      })
    }

  , 'should recieve an event method': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'click', spy)

      Syn.click(el)

      defer(function () {
        assert(spy.calledOnce, 'single call')
        assert.equals(spy.firstCall.args.length, 1, 'called with an object')
        assert(!!spy.firstCall.args[0].stop, 'called with an event object')
        done()
      })
    }

  , 'should be able to pass x amount of additional arguments': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'click', spy, 1, 2, 3)

      Syn.click(el)

      defer(function () {
        assert(spy.calledOnce, 'single call')
        assert.equals(spy.firstCall.args.length, 4, 'called with an event object and 3 additional arguments')
        assert.equals(spy.firstCall.args[1], 1, 'called with correct argument')
        assert.equals(spy.firstCall.args[2], 2, 'called with correct argument')
        assert.equals(spy.firstCall.args[3], 3, 'called with correct argument')
        done()
      })
    }

  , 'should be able to add multiple events by space seperating them': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()
 
      bean.add(el, 'click keypress', spy)

      Syn.click(el).key('j')

      defer(function () {
        assert(spy.calledTwice, 'adds multiple events by space seperating them')
        done()
      })
    }

  , 'should be able to add multiple events of the same type': function (done) {
      var el   = this.byId('input')
        , spy1 = this.spy()
        , spy2 = this.spy()
        , spy3 = this.spy()

      bean.add(el, 'click', spy1)
      bean.add(el, 'click', spy2)
      bean.add(el, 'click', spy3)

      Syn.click(el)

      defer(function () {
        assert(spy1.calledOnce, 'adds multiple events of the same type (1)')
        assert(spy2.calledOnce, 'adds multiple events of the same type (2)')
        assert(spy3.calledOnce, 'adds multiple events of the same type (3)')
        done()
      })
    }

  , 'should be able to add multiple events simultaneously with an object literal': function (done) {
      var el         = this.byId('input')
        , clickSpy   = this.spy()
        , keydownSpy = this.spy()

      bean.add(el, { click: clickSpy, keydown: keydownSpy })

      Syn.click(el).key('j')

      defer(function () {
        assert(clickSpy.calledOnce, 'adds multiple events simultaneously with an object literal (click)')
        assert(keydownSpy.calledOnce, 'adds multiple events simultaneously with an object literal (keydown)')
        done()
      })
    }

  , 'should bubble up dom': function (done) {
      var el1 = this.byId('foo')
        , el2 = this.byId('bar')
        , spy = this.spy()

      bean.add(el1, 'click', spy)

      Syn.click(el2)

      defer(function () {
        assert(spy.calledOnce, 'bubbles up dom')
        done()
      })
    }

  , 'shouldn\'t trigger event when adding additional custom event listeners': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'foo', spy)
      bean.add(el, 'foo', spy)

      defer(function () {
        refute(spy.called, 'additional custom event listeners trigger event')
        done()
      })
    }

  , 'should bind onmessage to window': function (done) {
      if (features.message) {
        var calls = 0
        this.removables.push(window)

        // unfortunately we can't use a spy here because we want to inspect the original event
        // object which isn't available in IE8 (and previous, but there is no postMessage in IE<8)
        // after a setTimeout()
        bean.add(window, 'message', function (event) {
          calls++
          assert(event, 'has event object argument')
          assert.equals(event.data, 'hello there', 'data should be copied')
          assert.same(event.origin, event.originalEvent.origin, 'origin should be copied')
          assert.same(event.source, event.originalEvent.source, 'source should be copied')
          done()
        })

        window.postMessage('hello there', '*')

        defer(function () {
          assert.equals(calls, 1, 'message event activated')
        })
      } else {
        assert(true, 'message events not supported by this browser, test bypassed')
        done()
      }
    }

  , 'one: should only trigger handler once': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.one(el, 'click', spy)
      Syn.click(el)
      Syn.click(el)
      Syn.click(el)

      defer(function () {
        assert(spy.calledOnce, 'handler called exactly one time')
        done()
      })
    }

  , 'one: should be removable': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.one(el, 'click', spy)
      bean.remove(el, 'click', spy)
      Syn.click(el)
      Syn.click(el)

      defer(function () {
        refute(spy.called, 'handler shouldn\'t be called')
        done()
      })
    }
})