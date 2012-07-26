/*global bean:true, qwery:true, buster:true, Syn:true, assert:true, defer:true, features:true, globalSetUp:true, globalTearDown:true*/

buster.testCase('delegate', {
    'setUp': function () {
      globalSetUp.call(this)

      this.verifySimpleDelegateSpy = function (spy, target) {
        assert.equals(spy.callCount, 2, 'delegated on selector')
        assert.same(spy.thisValues[0], target, 'context (this) was set to delegated element')
        assert.same(spy.thisValues[1], target, 'context (this) was set to delegated element')
        assert(spy.firstCall.args[0], 'got an event object argument')
        assert(spy.secondCall.args[0], 'got an event object argument')
        assert.same(spy.firstCall.args[0].currentTarget, target, 'degated event has currentTarget property correctly set')
        assert.same(spy.secondCall.args[0].currentTarget, target, 'degated event has currentTarget property correctly set')
      }
    }

  , 'tearDown': globalTearDown

  , 'should be able to delegate on selectors': function (done) {
      var el1 = this.byId('foo')
        , el2 = this.byId('bar')
        , el3 = this.byId('baz')
        , el4 = this.byId('bang')
        , spy = this.spy()

      bean.add(el1, '.bar', 'click', spy, qwery)

      Syn.click(el2)
      Syn.click(el3)
      Syn.click(el4)

      var self = this
      defer(function () {
        self.verifySimpleDelegateSpy(spy, el2)
        done()
      }, 50)
    }

  , 'should be able to delegate on arary': function (done) {
      var el1 = this.byId('foo')
        , el2 = this.byId('bar')
        , el3 = this.byId('baz')
        , el4 = this.byId('bang')
        , spy = this.spy()

      bean.add(el1, [el2], 'click', spy, qwery)

      Syn.click(el2)
      Syn.click(el3)
      Syn.click(el4)

      var self = this
      defer(function () {
        self.verifySimpleDelegateSpy(spy, el2)
        done()
      }, 50)
    }

  , 'should be able to remove delegated handler': function (done) {
      var el1   = this.byId('foo')
        , el2   = this.byId('bar')
        , calls = 0
        , fn    = function () {
            calls++
            bean.remove(el1, 'click', fn)
          }

      bean.add(el1, '.bar', 'click', fn, qwery)

      Syn.click(el2)
      Syn.click(el2)

      defer(function () {
        assert.equals(calls, 1, 'degegated event triggered once')
        done()
      }, 50)
    }

  , 'should use qSA if available': function (done) {
      if (!features.qSA) {
        assert(true, 'qSA not available in this browser, skipping test')
        return done()
      }

      var el1 = this.byId('foo')
        , el2 = this.byId('bar')
        , el3 = this.byId('baz')
        , el4 = this.byId('bang')
        , spy = this.spy()

      bean.add(el1, '.bar', 'click', spy)

      Syn.click(el2)
      Syn.click(el3)
      Syn.click(el4)

      var self = this
      defer(function () {
        self.verifySimpleDelegateSpy(spy, el2)
        done()
      }, 50)
    }

  , 'should throw error when no qSA available and no selector engine set': function (done) {
      if (features.qSA) {
        assert(true, 'qSA available in this browser, skipping test')
        return done()
      }

      var el1 = this.byId('foo')
        , el2 = this.byId('bar')
        , spy = this.spy()

      bean.add(el1, '.bar', 'click', spy)

      window.onerror = function (e) {
        assert(e.toString(), /Bean/, 'threw Error on delegated event trigger without selector engine or qSA')
        window.onerror = null
      }

      Syn.click(el2)

      defer(function () {
        assert.equals(spy.callCount, 0, 'don\'t fire delegated event without selector engine or qSA')
        done()
      })
    }

  , 'should be able to set a default selector engine': function (done) {
      var el1      = this.byId('foo')
        , el2      = this.byId('bar')
        , el3      = this.byId('baz')
        , el4      = this.byId('bang')
        , selector = "SELECTOR? WE DON'T NEED NO STINKIN' SELECTOR!"
        , stub     = this.stub()
        , spy      = this.spy()

      stub.returns([el2])
      // TODO: findTarget() is called for setting event.currentTarget as well as checking for a match
      // fix this so it's only called once, otherwise it's a waste
      bean.setSelectorEngine(stub)

      bean.add(el1, selector, 'click', spy)

      Syn.click(el2)
      Syn.click(el3)
      Syn.click(el4)

      var self = this
      defer(function () {
        // 6, see? lots of wasteful calls
        assert.equals(stub.callCount, 6, 'selector engine called')
        assert.same(stub.firstCall.args[0], selector, 'selector engine called with selector argument')
        assert.same(stub.firstCall.args[1], el1, 'selector engine called with root argument')
        self.verifySimpleDelegateSpy(spy, el2)
        bean.setSelectorEngine(null)
        done()
      }, 50)
    }
})