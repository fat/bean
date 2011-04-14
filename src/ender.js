!function () {
  var b = bean.noConflict(),
      integrate = function (method, type, method2) {
        var _args = type ? [type] : [];
        return function () {
          for (var args, i = 0, l = this.elements.length; i < l; i++) {
            args = [this.elements[i]].concat(_args, Array.prototype.slice.call(arguments, 0));
            args.length == 4 && args.push($);
            b[method].apply(this, args);
          }
          return this;
        };
      };

  var add = integrate('add'),
      remove = integrate('remove');

  var methods = {
    bind: add,
    listen: add,
    delegate: add,
    undelegate: remove,
    unbind: remove,
    unlisten: remove,
    trigger: integrate('fire'),
    cloneEvents: integrate('clone'),
    hover: function (enter, leave) {
      for (var i = 0, l = this.elements.length; i < l; i++) {
        b.add.call(this, this.elements[i], 'mouseenter', enter);
        b.add.call(this, this.elements[i], 'mouseleave', leave);
      }
      return this;
    }
  };

  var shortcuts = [
    'blur', 'change', 'click', 'dbltclick', 'error', 'focus', 'focusin',
    'focusout', 'keydown', 'keypress', 'keyup', 'load', 'mousedown',
    'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'mouseup',
    'resize', 'scroll', 'select', 'submit', 'unload'
  ];

  for (var i = shortcuts.length; i--;) {
    var shortcut = shortcuts[i];
    methods[shortcut] = integrate('add', shortcut);
  }

  $.ender(methods, true);
}();