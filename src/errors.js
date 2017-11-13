Error.subclass = function(errorName) {
  var newError = function(message, data) {
    this.name    = errorName;
    this.message = (message || "");
    this.data = data;
  };

  newError.subclass = this.subclass;
  inherits(newError, this);

  return newError;
};

export var NetworkError = Error.subclass("NetworkError");
export var NotFoundError = NetworkError.subclass("NotFoundError");
export var BadRequestError = Error.subclass("BadRequestError");
export var BadResponseError = Error.subclass("BadResponseError");

/**
 * From: https://github.com/joyent/node/blob/master/lib/util.js
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 * @private
 */
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}
