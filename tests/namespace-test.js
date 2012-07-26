/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('namespaces', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should be able to name handlers': function (done) {
      var el1 = this.byId('foo')
        , spy = this.spy()

      bean.add(el1, 'click.fat', spy)

      Syn.click(el1)

      defer(function () {
        assert.equals(spy.callCount, 1, 'triggered click event')
        done()
      })
    }

  , 'should be able to add multiple handlers under the same namespace to the same element': function (done) {
      var el1  = this.byId('foo')
        , spy1 = this.spy()
        , spy2 = this.spy()

      bean.add(el1, 'click.fat', spy1)
      bean.add(el1, 'click.fat', spy2)

      Syn.click(el1)

      defer(function () {
        assert.equals(spy1.callCount, 1, 'triggered click event')
        assert.equals(spy2.callCount, 1, 'triggered click event')
        done()
      })
    }

  , 'should be able to fire an event without handlers': function () {
      var el1 = this.byId('foo')

      bean.fire(el1, 'click.fat')

      assert(true, 'fire namespaced event with no handlers (no exception)')
    }

  , 'should be able to target namespaced event handlers with fire': function (done) {
      var el1  = this.byId('foo')
        , spy1 = this.spy()
        , spy2 = this.spy()

      bean.add(el1, 'click.fat', spy1)
      bean.add(el1, 'click', spy2)

      bean.fire(el1, 'click.fat')

      defer(function () {
        assert.equals(spy1.callCount, 1, 'triggered click event (namespaced)')
        assert.equals(spy2.callCount, 0, 'should not trigger click event (plain)')
        done()
      })
    }

    // changed in 0.5 so this doesn't fire, namespaces need to match
  , 'should not be able to target multiple namespaced event handlers with fire': function (done) {
      var el1  = this.byId('foo')
        , spy1 = this.spy()
        , spy2 = this.spy()
        , spy3 = this.spy()

      bean.add(el1, 'click.fat', spy1)
      bean.add(el1, 'click.ded', spy2)
      bean.add(el1, 'click', spy3)

      bean.fire(el1, 'click.fat.ded')

      defer(function () {
        assert.equals(spy1.callCount, 0, 'should not trigger click event (namespaced)')
        assert.equals(spy2.callCount, 0, 'should not trigger click event (namespaced)')
        assert.equals(spy3.callCount, 0, 'should not trigger click event (plain)')
        done()
      })
    }

  , 'should be able to remove handlers based on name': function (done) {
      var el1  = this.byId('foo')
        , spy1 = this.spy()
        , spy2 = this.spy()

      bean.add(el1, 'click.ded', spy1)
      bean.add(el1, 'click', spy2)
      bean.remove(el1, 'click.ded')

      Syn.click(el1)

      defer(function () {
        assert.equals(spy1.callCount, 0, 'should not trigger click event (namespaced)')
        assert.equals(spy2.callCount, 1, 'triggered click event (plain)')
        done()
      })
    }

    // changed in 0.5 so this doesn't remove, namespaces need to match
  , 'should not be able to remove multiple handlers based on name': function (done) {
      var el1  = this.byId('foo')
        , spy1 = this.spy()
        , spy2 = this.spy()
        , spy3 = this.spy()

      bean.add(el1, 'click.fat', spy1)
      bean.add(el1, 'click.ded', spy2)
      bean.add(el1, 'click', spy3)
      bean.remove(el1, 'click.ded.fat')

      Syn.click(el1)

      defer(function () {
        assert.equals(spy1.callCount, 1, 'triggered click event (namespaced)')
        assert.equals(spy2.callCount, 1, 'triggered click event (namespaced)')
        assert.equals(spy3.callCount, 1, 'triggered click event (plain)')
        done()
      })
    }

  , 'should be able to add multiple custom events to a single handler and call them individually': function (done) {
      var el1 = this.byId('foo')
        , spy = this.spy()

      bean.add(el1, 'fat.test1 fat.test2', spy)
      bean.fire(el1, 'fat.test1', ['1'])
      bean.fire(el1, 'fat.test2', ['2'])

      defer(function () {
        assert.equals(spy.callCount, 2, 'triggered custom event')
        assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
        assert.equals(spy.secondCall.args[0], '2', 'expected array argument')
        done()
      })
    }
    
  , 'should be able to fire an event if the fired namespace is within the event namespace range': function (done) {
      var el1 = this.byId('foo')
        , spy = this.spy()

      bean.add(el1, 'fat.test1.foo fat.test2.foo', spy)
      bean.fire(el1, 'fat.test1', ['1'])
      bean.fire(el1, 'fat.test2', ['2'])
      bean.fire(el1, 'fat.foo', ['3'])

      defer(function () {
        assert.equals(spy.callCount, 4, 'triggered custom event')
        assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
        assert.equals(spy.secondCall.args[0], '2', 'expected array argument')
        assert.equals(spy.thirdCall.args[0], '3', 'expected array argument')
        assert.equals(spy.lastCall.args[0], '3', 'expected array argument')
        done()
      })
    }

  , 'should be able to fire multiple events and fire them regardless of the order of the namespaces': function (done) {
      var el1 = this.byId('foo')
        , spy = this.spy()

      bean.add(el1, 'fat.test.foo fat.foo.test', spy)
      bean.fire(el1, 'fat.test.foo', ['1'])
      bean.fire(el1, 'fat.foo.test', ['2'])

      defer(function () {
        assert.equals(spy.callCount, 4, 'triggered custom event')
        assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
        assert.equals(spy.secondCall.args[0], '1', 'expected array argument')
        assert.equals(spy.thirdCall.args[0], '2', 'expected array argument')
        assert.equals(spy.lastCall.args[0], '2', 'expected array argument')
        done()
      })
    }
    
  , 'should only fire an event if the fired namespaces is within the event namespace or if the event namespace is within the fired namespace': function (done) {
      var el1 = this.byId('foo')
        , spy = this.spy()

      bean.add(el1, 'fat.test.foo.ded fat.foo.test fat.ded', spy)
      bean.fire(el1, 'fat.test.foo', ['1'])
      bean.fire(el1, 'fat.foo.test', ['2'])
      bean.fire(el1, 'fat.test.ded', ['3'])

      defer(function () {
        assert.equals(spy.callCount, 5, 'triggered custom event')
        assert.equals(spy.firstCall.args[0], '1', 'expected array argument')
        assert.equals(spy.secondCall.args[0], '1', 'expected array argument')
        assert.equals(spy.thirdCall.args[0], '2', 'expected array argument')
        assert.equals(spy.getCall(3).args[0], '2', 'expected array argument')
        assert.equals(spy.getCall(4).args[0], '3', 'expected array argument')
        done()
      })
    }
})