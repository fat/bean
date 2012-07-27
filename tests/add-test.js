/*global bean:true, buster:true, Syn:true, assert:true, SpyTrigger:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('add', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should return the element passed in': function () {
      var el       = this.byId('input')
        , returned = bean.add(el, 'click', function () {})

      assert.same(el, returned, 'returns the element passed in')
    }

  , 'should be able to add single events to elements': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function() {
        assert(spy.calledOnce, 'adds single events to elements ')
        done()
      })

      bean.add(el, 'click', trigger.wrap(spy))

      Syn.click(el)
    }

  , 'should be able to add single events to objects': function (done) {
      var obj     = this.newObj()
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'adds single events to objects')
        done()
      })

      bean.add(obj, 'complete', trigger.wrap(spy))
      bean.fire(obj, 'complete')
      bean.remove(obj)
      bean.fire(obj, 'complete')
    }

  , 'scope should be equal to element': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'single call')
        assert(spy.calledOn(el), 'called with element as scope (this)')
        done()
      })

      bean.add(el, 'click', trigger.wrap(spy))

      Syn.click(el)
    }

  , 'should recieve an event method': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'single call')
        assert.equals(spy.firstCall.args.length, 1, 'called with an object')
        assert(!!spy.firstCall.args[0].stop, 'called with an event object')
        done()
      })

      bean.add(el, 'click', trigger.wrap(spy))

      Syn.click(el)
    }

  , 'should be able to pass x amount of additional arguments': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'single call')
        assert.equals(spy.firstCall.args.length, 4, 'called with an event object and 3 additional arguments')
        assert.equals(spy.firstCall.args[1], 1, 'called with correct argument')
        assert.equals(spy.firstCall.args[2], 2, 'called with correct argument')
        assert.equals(spy.firstCall.args[3], 3, 'called with correct argument')
        done()
      })

      bean.add(el, 'click', trigger.wrap(spy), 1, 2, 3)

      Syn.click(el)
    }

  , 'should be able to add multiple events by space seperating them': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledTwice, 'adds multiple events by space seperating them')
        done()
      })
 
      bean.add(el, 'click keypress', trigger.wrap(spy))

      Syn.click(el).key('j')
    }

  , 'should be able to add multiple events of the same type': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy1    = this.spy()
        , spy2    = this.spy()
        , spy3    = this.spy()

      trigger.after(function () {
        assert(spy1.calledOnce, 'adds multiple events of the same type (1)')
        assert(spy2.calledOnce, 'adds multiple events of the same type (2)')
        assert(spy3.calledOnce, 'adds multiple events of the same type (3)')
        done()
      })

      bean.add(el, 'click', trigger.wrap(spy1))
      bean.add(el, 'click', trigger.wrap(spy2))
      bean.add(el, 'click', trigger.wrap(spy3))

      Syn.click(el)
    }

  , 'should be able to add multiple events simultaneously with an object literal': function (done) {
      var el         = this.byId('input')
        , trigger    = this.trigger()
        , clickSpy   = this.spy()
        , keydownSpy = this.spy()

      trigger.after(function () {
        assert(clickSpy.calledOnce, 'adds multiple events simultaneously with an object literal (click)')
        assert(keydownSpy.calledOnce, 'adds multiple events simultaneously with an object literal (keydown)')
        done()
      })

      bean.add(el, { click: trigger.wrap(clickSpy), keydown: trigger.wrap(keydownSpy) })

      Syn.click(el).key('j')
    }

  , 'should bubble up dom': function (done) {
      var el1     = this.byId('foo')
        , el2     = this.byId('bar')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'bubbles up dom')
        done()
      })

      bean.add(el1, 'click', trigger.wrap(spy))

      Syn.click(el2)
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
          , trigger = this.trigger()

        this.removables.push(window)

        trigger.after(function () {
          assert.equals(calls, 1, 'message event activated')
        })

        // unfortunately we can't use a spy here because we want to inspect the original event
        // object which isn't available in IE8 (and previous, but there is no postMessage in IE<8)
        // after a setTimeout()
        bean.add(window, 'message', trigger.wrap(function (event) {
          calls++
          assert(event, 'has event object argument')
          assert.equals(event.data, 'hello there', 'data should be copied')
          assert.same(event.origin, event.originalEvent.origin, 'origin should be copied')
          assert.same(event.source, event.originalEvent.source, 'source should be copied')
          done()
        }))

        window.postMessage('hello there', '*')
      } else {
        assert(true, 'message events not supported by this browser, test bypassed')
        done()
      }
    }

  , 'one: should only trigger handler once': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'handler called exactly one time')
        done()
      })

      bean.one(el, 'click', trigger.wrap(spy))
      Syn.click(el)
      Syn.click(el)
      Syn.click(el)
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