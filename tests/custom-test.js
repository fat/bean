/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('custom', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'custom: should be able to add single custom events': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'partytime', spy)
      bean.fire(el, 'partytime')

      defer(function () {
        assert(spy.calledOnce, 'add single custom events')
        done()
      })
    }

  , 'custom: should bubble up dom like traditional events': function (done) {
      if (features.w3c) {
        //dean edwards' onpropertychange hack doesn't bubble unfortunately :(
        var el1 = this.byId('foo')
          , el2 = this.byId('bar')
          , spy = this.spy()

        bean.add(el1, 'partytime', spy)
        bean.fire(el2, 'partytime')
  
        defer(function () {
          assert(spy.calledOnce, 'bubbles up dom like traditional events')
          done()
        })
      } else {
        assert(true, 'onpropertychange bubbling not supported by this browser, test bypassed')
        done()
      }
    }

  , 'custom: should be able to add, fire and remove custom events to document': function (done) {
      var calls = 0
      this.removables.push(document)

      bean.add(document, 'justlookatthat', function () {
        calls++
        bean.remove(document, 'justlookatthat')
      })
      bean.fire(document, 'justlookatthat')
      bean.fire(document, 'justlookatthat')

      defer(function () {
        assert.equals(calls, 1, 'add custom events to document')
        done()
      })
    }

  , 'custom: should be able to add, fire and remove custom events to window': function (done) {
      var calls = 0
      this.removables.push(window)

      bean.add(window, 'spiffy', function () {
        calls++
        bean.remove(window, 'spiffy')
      })
      bean.fire(window, 'spiffy')
      bean.fire(window, 'spiffy')

      defer(function () {
        assert.equals(calls, 1, 'add custom events to window')
        done()
      })
    }
})