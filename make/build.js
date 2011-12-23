require('smoosh').config({
    'JAVASCRIPT': {
        'DIST_DIR': './'
      , 'bean': [
            './src/copyright.js'
          , './src/bean.js'
        ]
    }
  , 'JSHINT_OPTS': {
        'boss': true
      , 'forin': true
      , 'curly': false
      , 'debug': true
      , 'devel': false
      , 'evil': false
      , 'regexp': false
      , 'undef': true
      , 'sub': true
      , 'white': false
      , 'indent': 2
      , 'whitespace': true
      , 'asi': true
      , 'trailing': true
      , 'latedef': true
      , 'laxbreak': true
      , 'browser': true
      , 'eqeqeq': true
      , 'bitwise': false
      , 'loopfunc': false
    }
}).run().build().analyze()
