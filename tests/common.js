/*global bean:true*/

var fixturesHTML =
  '<input id="input" type="text" />\n' +
  '<input id="input2" type="text" />\n' +
  '<div id="foo">\n' +
  '  <div id="bar" class="bar">\n' +
  '    <div id="bang" class="bang"></div>\n' +
  '  </div>\n' +
  '  <div id="baz" class="baz"></div>\n' +
  '</div>\n' +
  '<div id="stopper">\n' +
  '  <input type="text" id="txt" value="">\n' +
  '</div>\n'


var features = {
        w3c: !!window.addEventListener
      , qSA: !!document.querySelectorAll
      , createEvent: (function () {
          try {
            document.createEvent('KeyEvents')
            return true
          } catch (e) {
            try {
              document.createEvent('TextEvent')
              return true
            } catch (e) { }
          }
          return false
        }())
      , message: !!window.postMessage
      , history: !!window.history && !!window.history.pushState
    }
  , defer = function (fn, t) {
      setTimeout(fn, t || 1)
    }
  , insertFixtures = function () {
      document.body.appendChild((function() {
        var fixtures = document.createElement('div')
        fixtures.id = 'fixtures'
        fixtures.innerHTML = fixturesHTML
        fixtures.style.position = 'absolute'
        fixtures.style.left = '-999px'
        return fixtures
      }()))
    }
  , removeFixtures = function () {
      document.body.removeChild(document.getElementById('fixtures'))
    }
  , globalSetUp = function () {
      var removables = this.removables = []

      this.byId = function (id) {
        var el = document.getElementById(id)
        if (el) removables.push(el) // auto clean up
        return el
      }

      this.newObj = function () {
        var obj = {}
        removables.push(obj) // auto clean up
        return obj
      }

      this.createElement = function (tag) {
        var el = document.createElement(tag)
        removables.push(el)
        return el
      }

    }
  , globalTearDown = function () {
      for (var i = 0; i < this.removables.length; i++)
        bean.remove(this.removables[i])

      //removeFixtures()
    }

if (!window.console) window.console = { log: function () {}}

insertFixtures()