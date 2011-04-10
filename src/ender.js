!function () {
  var b = bean.noConflict(),
      integrate = function (type) {
        return function () {
          for (var i = 0, l = this.elements.length; i < l; i++) {
            b[type].apply(this, [this.elements[i]].concat(Array.prototype.slice.call(arguments, 0)));
          }
          return this;
        }
      };

  $.ender({
    bind: integrate('add'),
    unbind: integrate('remove'),
    trigger: integrate('fire'),
    cloneEvents: integrate('clone')
  }, true);
}();