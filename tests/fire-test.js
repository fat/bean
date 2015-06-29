/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('fire', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to fire an event': function (done) {
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()

      trigger.after(function () {
        assert(spy.calledOnce, 'fires an event')
        done()
      })

      bean.on(el, 'click', trigger.wrap(spy))
      bean.fire(el, 'click')
    }

  , 'should be able to fire multiple events by space seperation': function (done) {
      var el           = this.byId('input')
        , trigger      = this.trigger()
        , mouseDownSpy = this.spy()
        , mouseUpSpy   = this.spy()

      trigger.after(function () {
        assert(mouseDownSpy.calledOnce, 'fires multiple events by space seperation (mousedown)')
        assert(mouseUpSpy.calledOnce  , 'fires multiple events by space seperation (mouseup)')
        done()
      })

      bean.on(el, 'mousedown', trigger.wrap(mouseDownSpy))
      bean.on(el, 'mouseup', trigger.wrap(mouseUpSpy))
      bean.fire(el, 'mousedown mouseup')
    }

  , 'should be able to pass extra arguments to custom event': function (done) {
      // jquery like array syntax
      var el      = this.byId('input')
        , trigger = this.trigger()
        , spy     = this.spy()
        , extra   = [1, 2, 3]
        , slice   = extra.slice
        , type    = 'foo'

      trigger.after(function () {
        assert.equals(spy.callCount, 1, 'single call')
        assert.equals(spy.firstCall.args.length, 1+extra.length, 'called with correct arguments.length')
        assert.equals(typeof(spy.firstCall.args[0] || 0), 'object', 'called with correct arguments[0] type')
        assert.equals(spy.firstCall.args[0].type, type.split('.')[0], 'called with correct event.type')
        assert.equals(slice.call(spy.firstCall.args, 1).join(), extra.join(), 'called with correct extra arguments')
        done()
      })

      bean.on(el, type, trigger.wrap(spy))
      bean.fire(el, type, extra)
    }
})