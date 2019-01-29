"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var NetworkError = exports.NetworkError = function (_extendableBuiltin2) {
  _inherits(NetworkError, _extendableBuiltin2);

  function NetworkError(message, response) {
    _classCallCheck(this, NetworkError);

    var _this = _possibleConstructorReturn(this, (NetworkError.__proto__ || Object.getPrototypeOf(NetworkError)).call(this, message));

    _this.constructor = NetworkError;
    _this.response = response;
    return _this;
  }

  _createClass(NetworkError, [{
    key: "getResponse",
    value: function getResponse() {
      return this.response;
    }
  }]);

  return NetworkError;
}(_extendableBuiltin(Error));

var NotFoundError = exports.NotFoundError = function (_NetworkError) {
  _inherits(NotFoundError, _NetworkError);

  function NotFoundError(message, response) {
    _classCallCheck(this, NotFoundError);

    var _this2 = _possibleConstructorReturn(this, (NotFoundError.__proto__ || Object.getPrototypeOf(NotFoundError)).call(this, message, response));

    _this2.constructor = NotFoundError;
    return _this2;
  }

  return NotFoundError;
}(NetworkError);

var BadRequestError = exports.BadRequestError = function (_NetworkError2) {
  _inherits(BadRequestError, _NetworkError2);

  function BadRequestError(message, response) {
    _classCallCheck(this, BadRequestError);

    var _this3 = _possibleConstructorReturn(this, (BadRequestError.__proto__ || Object.getPrototypeOf(BadRequestError)).call(this, message, response));

    _this3.constructor = BadRequestError;
    return _this3;
  }

  return BadRequestError;
}(NetworkError);

var BadResponseError = exports.BadResponseError = function (_NetworkError3) {
  _inherits(BadResponseError, _NetworkError3);

  function BadResponseError(message, response) {
    _classCallCheck(this, BadResponseError);

    var _this4 = _possibleConstructorReturn(this, (BadResponseError.__proto__ || Object.getPrototypeOf(BadResponseError)).call(this, message, response));

    _this4.constructor = BadResponseError;
    return _this4;
  }

  return BadResponseError;
}(NetworkError);