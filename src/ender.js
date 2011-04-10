!function () {
  var b = bean.noConflict(),
      integrate = function (method, type, method2) {
        var args = type ? [type] : [];
        return function () {
          for (var i = 0, l = this.elements.length; i < l; i++) {
            args.unshift(this.elements[i]);
            b[method].apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
          }
          return this;
        }
      };

  var add = integrate('add'),
      remove = integrate('remove');

  var methods = {
    bind: add,
    listen: add,
    delegate: add,
    unbind: remove,
    unlisten: remove,
    undelegate: remove,
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