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
export var TransactionFailedError = NetworkError.subclass("TransactionFailedError");     // -1
export var TransactionTooEarlyError = NetworkError.subclass("TransactionTooEarlyError"); // -2
export var TransactionTooLateError = NetworkError.subclass("TransactionTooLateError");   // -2
export var MissingOperationError = NetworkError.subclass("MissingOperationError");       // -4
export var BadSequenceError = NetworkError.subclass("BadSequenceError");                 // -5
export var NotEnoughSignaturesError = NetworkError.subclass("NotEnoughSignaturesError"); // -6
export var InsufficientBalanceError = NetworkError.subclass("InsufficientBalanceError"); // -7
export var NotFoundError = NetworkError.subclass("NotFoundError");                       // -8
export var InsufficientFeeError = NetworkError.subclass("InsufficientFeeError");         // -9
export var TooManySignaturesError = NetworkError.subclass("TooManySignaturesError");     // -10
export var InternalError = NetworkError.subclass("InternalError");                       // -11

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
