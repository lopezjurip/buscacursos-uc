'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sanitizer = function () {
  function Sanitizer($) {
    _classCallCheck(this, Sanitizer);

    this.$ = $;
  }

  _createClass(Sanitizer, [{
    key: 'text',
    value: function text(node) {
      var value = (0, _trim2.default)(node.text());
      return value;
      // const temp = value.toLowerCase();
      // return (temp === '(por asignar)' || temp === 'por fijar') ? fallback : value;
    }
  }, {
    key: 'number',
    value: function number(node) {
      var value = this.text(node);
      return Number(value);
    }
  }, {
    key: 'boolean',
    value: function boolean(node) {
      var value = this.text(node);
      return value && value.toUpperCase() === 'SI';
    }
  }]);

  return Sanitizer;
}();

exports.default = Sanitizer;