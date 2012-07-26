/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('fire', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to fire an event': function (done) {
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'click', spy)
      bean.fire(el, 'click')

      defer(function () {
        assert(spy.calledOnce, 'fires an event')
        done()
      })
    }

  , 'should be able to fire multiple events by space seperation': function (done) {
      var el           = this.byId('input')
        , mouseDownSpy = this.spy()
        , mouseUpSpy   = this.spy()

      bean.add(el, 'mousedown', mouseDownSpy)
      bean.add(el, 'mouseup', mouseUpSpy)
      bean.fire(el, 'mousedown mouseup')

      defer(function () {
        assert(mouseDownSpy.calledOnce, 'fires multiple events by space seperation (mousedown)')
        assert(mouseUpSpy.calledOnce  , 'fires multiple events by space seperation (mouseup)')
        done()
      })
    }

  , 'should be able to pass multiple arguments to custom event': function (done) {
      // jquery like array syntax
      var el  = this.byId('input')
        , spy = this.spy()

      bean.add(el, 'foo', spy)
      bean.fire(el, 'foo', [1, 2, 3])

      defer(function () {
        assert(spy.calledOnce, 'single call')
        assert.equals(spy.firstCall.args.length, 3, 'called with 3 arguments')
        assert.equals(spy.firstCall.args[0], 1, 'called with correct argument 1')
        assert.equals(spy.firstCall.args[1], 2, 'called with correct argument 2')
        assert.equals(spy.firstCall.args[2], 3, 'called with correct argument 3')
        done()
      })
    }
})