require('../support/smoosh').config({
  "JAVASCRIPT": {
    "DIST_DIR": "./",
    "bean": [
      "./src/copyright.js",
      "./src/bean.js"
    ]
  },
  "JSHINT_OPTS": {
    "boss": true,
    "forin": true,
    "curly": true,
    "debug": false,
    "devel": false,
    "evil": false,
    "regexp": false,
    "undef": false,
    "sub": false,
    "white": true,
    "indent": 2,
    "whitespace": true,
    "asi": false
  }
}).run().build().analyze();