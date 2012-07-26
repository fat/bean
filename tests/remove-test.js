/*global bean:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('remove', {
    'setUp': globalSetUp
  , 'tearDown': globalTearDown

  , 'should return the element passed in': function () {
      var el      = this.byId('foo')
        , handler = function () {}
        , returned

      bean.add(el, 'click', handler)
      returned = bean.remove(el, 'click', handler)

      assert.same(el, returned, 'returns the element passed in')
    }

  , 'should be able to remove a single event': function (done) {
      var el      = this.byId('foo')
        , calls   = 0
        , handler = function () {
            calls++
            bean.remove(el, 'click', handler)
            Syn.click(el)
          }

      bean.add(el, 'click', handler)

      Syn.click(el)

      defer(function () {
        assert.equals(calls, 1, 'remove a single event')
        done()
      }, 50)
    }

  , 'should be able to remove mulitple events with an object literal': function (done) {
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = function () {
            calls++
            bean.remove(el, {
                click   : handler1
              , keydown : handler2
            })
            Syn.click(el)
            Syn.key('j', el)
          }
        , handler2 = this.spy()
        , handler3 = this.spy()

      bean.add(el, 'click'  , handler1)
      bean.add(el, 'keydown', handler2)
      bean.add(el, 'keydown', handler3)

      Syn.click(el)

      defer(function () {
        assert.equals(calls, 1, 'remove a events with object literal')
        refute(handler2.called, 'correct handler properly removed')
        assert.equals(handler3.callCount, 1, 'non-matching handler should not be removed')
        done()
      }, 50)
    }

  , 'should be able to remove all events of a specific type': function (done) {
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = this.spy()
        , handler2 = function () {
            calls++
            bean.remove(el, 'click')
            Syn.click(el)
          }

      bean.add(el, 'click', handler1)
      bean.add(el, 'click', handler2)

      Syn.click(el)

      defer(function () {
        assert.equals(calls, 1, 'removes all events of a specific type')
        assert.equals(handler1.callCount, 1, 'removes all events of a specific type')
        done()
      }, 50)
    }

  , 'should be able to remove all events of a specific type (multiple)': function (done) {
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = this.spy()
        , handler2 = function () {
            calls++
            bean.remove(el, 'mousedown mouseup')
            Syn.click(el)
          }

      bean.add(el, 'mousedown', handler1)
      bean.add(el, 'mouseup', handler2)

      Syn.click(el)

      defer(function () {
        assert.equals(calls, 1, 'removes all events of a specific type')
        assert.equals(handler1.callCount, 1, 'removes all events of a specific type')
        done()
      }, 50)
    }

  , 'should be able to remove all events': function (done) {
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = function () {
            calls++
            bean.remove(el)
            Syn.click(el)
            Syn.key('j', el)
          }
        , handler2 = this.spy()
  
      bean.add(el, 'click', handler1)
      bean.add(el, 'keydown', handler2)
  
      Syn.click(el)

      defer(function () {
        assert.equals(calls, 1, 'removes all events')
        assert.equals(handler2.callCount, 0, 'removes all events')
        done()
      }, 50)
    }

  , 'should only remove events of specified type': function (done) {
      // testing that bean.remove(el, type) removes *only* of that type and no others
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = this.spy()
        , handler2 = function (e) {
            calls++
            bean.remove(el, e.type)
          }

      bean.add(el, 'click', handler1)
      bean.add(el, 'keyup', handler1)
      bean.add(el, 'click', handler2)
      bean.add(el, 'keyup', handler2)

      Syn.click(el)
      Syn.key(el, 'f')
      Syn.click(el)
      Syn.key(el, 'f')

      defer(function () {
        assert.equals(calls, 2, 'removes all events of a specific type')
        assert.equals(handler1.callCount, 2, 'removes all events of a specific type')
        done()
      })
    }

  , 'should only remove events for specified handler': function (done) {
      // testing that bean.remove(el, fn) removes *only* that handler and no others
      var el       = this.byId('input')
        , handler1 = this.spy()
        , handler2 = this.spy()

      bean.add(el, 'click', handler1)
      bean.add(el, 'keyup', handler1)
      bean.add(el, 'click', handler2)
      bean.add(el, 'keyup', handler2)
      bean.remove(el, handler1)

      Syn.click(el)
      Syn.key(el, 'f')

      defer(function () {
        assert.equals(handler1.callCount, 0, 'removes all events of a specific handler')
        assert.equals(handler2.callCount, 2, 'removes all events of a specific handler')
        done()
      })
    }

  , 'should remove all events, including namespaced': function (done) {
      // testing that bean.remove(el, fn) removes *only* that handler and no others
      var el       = this.byId('input')
        , handler1 = this.spy()
        , handler2 = this.spy()

      bean.add(el, 'click.foo', handler1)
      bean.add(el, 'click', handler1)
      bean.add(el, 'keyup.bar', handler2)
      bean.add(el, 'keyup', handler2)
      bean.remove(el)

      Syn.click(el)
      Syn.key(el, 'f')

      defer(function () {
        assert.equals(handler1.callCount, 0, 'removes all events')
        assert.equals(handler2.callCount, 0, 'removes all events')
        done()
      })
    }

  , 'should be able to remove all events of a certain namespace': function (done) {
      var el       = this.byId('input')
        , calls    = 0
        , handler1 = function () {
            calls++
            bean.remove(el, '.foo')
            Syn.click(el)
            Syn.key('j', el)
          }
        , handler2 = this.spy()
        , handler3 = this.spy()

      bean.add(el, 'click.foo', handler1)
      bean.add(el, 'keydown.foo', handler2)
      bean.add(el, 'click.bar', handler3)

      Syn.click(el)

      defer(function () {
        //assert.equals(calls, 1, 'removes all events of a certain namespace')
        //assert.equals(handler2.callCount, 0, 'removes all events of a certain namespace')
        assert.equals(handler3.callCount, 2, 'removes all events of a certain namespace')
        done()
      }, 50)
    }

  , 'should only remove event if the remove namespaces is within the event namespace or if the event namespace is within the remove namespace': function (done) {
      var el  = this.byId('foo')
        , spy = this.spy()

      bean.remove(el)
      bean.add(el, 'fat.test1.foo.ded fat.test2.foo fat.test1.foo', spy)
      bean.fire(el, 'fat.test1.ded', ['1'])
      bean.fire(el, 'fat.test2', ['2'])
      bean.remove(el, '.foo.ded')
      bean.fire(el, 'fat.foo', ['3'])

      defer(function () {
        assert.equals(spy.callCount, 4, 'calls on appropriate namespaces')
        done()
      })
    }
})