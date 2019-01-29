'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FriendbotBuilder = undefined;

var _call_builder = require('./call_builder');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FriendbotBuilder = exports.FriendbotBuilder = function (_CallBuilder) {
  _inherits(FriendbotBuilder, _CallBuilder);

  function FriendbotBuilder(url, address) {
    _classCallCheck(this, FriendbotBuilder);

    var _this = _possibleConstructorReturn(this, (FriendbotBuilder.__proto__ || Object.getPrototypeOf(FriendbotBuilder)).call(this, url));

    _this.url.segment('friendbot');
    _this.url.setQuery('addr', address);
    return _this;
  }

  return FriendbotBuilder;
}(_call_builder.CallBuilder);