'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OfferCallBuilder = undefined;

var _call_builder = require('./call_builder');

var _errors = require('./errors');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Creates a new {@link OfferCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#offers}.
 *
 * @see [Offers for Account](https://www.stellar.org/developers/horizon/reference/offers-for-account.html)
 * @class OfferCallBuilder
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Horizon server URL.
 * @param {string} resource Resource to query offers
 * @param {...string} resourceParams Parameters for selected resource
 */
var OfferCallBuilder = exports.OfferCallBuilder = function (_CallBuilder) {
  _inherits(OfferCallBuilder, _CallBuilder);

  function OfferCallBuilder(serverUrl, resource) {
    _classCallCheck(this, OfferCallBuilder);

    var _this = _possibleConstructorReturn(this, (OfferCallBuilder.__proto__ || Object.getPrototypeOf(OfferCallBuilder)).call(this, serverUrl));

    if (resource === 'accounts') {
      for (var _len = arguments.length, resourceParams = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        resourceParams[_key - 2] = arguments[_key];
      }

      _this.url.segment([resource].concat(resourceParams, ['offers']));
    } else {
      throw new _errors.BadRequestError('Bad resource specified for offer:', resource);
    }
    return _this;
  }

  return OfferCallBuilder;
}(_call_builder.CallBuilder);