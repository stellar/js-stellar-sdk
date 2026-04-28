import { OperationAttributes } from "../operations/types.js";
import xdr from "../xdr.js";
import { best_r } from "./continued_fraction.js";
import { decodeAddressToMuxedAccount } from "./decode_encode_muxed_account.js";
import BigNumber from "./bignumber.js";
export const ONE = 10000000;
const MAX_INT64 = "9223372036854775807";

/** Sets the source account on the operation attributes from the opts. */
export function setSourceAccount(
  opAttributes: OperationAttributes,
  opts: { source?: string },
) {
  if (opts.source) {
    try {
      opAttributes.sourceAccount = decodeAddressToMuxedAccount(opts.source);
    } catch (e) {
      throw new Error("Source address is invalid");
    }
  }
}

/**
 * Returns value converted to uint32 value or undefined.
 * If `value` is not `Number`, `String` or `Undefined` then throws an error.
 * Used in {@link Operation.setOptions}.
 *
 * @param name - name of the property (used in error message only)
 * @param value - value to check
 * @param isValidFunction - function to check other constraints (the argument will be a `Number`)
 */
export function checkUnsignedIntValue(
  name: string,
  value: number | string | undefined,
  isValidFunction: ((value: number, name: string) => boolean) | null = null,
): number | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  const numValue =
    typeof value === "string"
      ? value.trim() === ""
        ? NaN
        : Number(value)
      : value;

  if (
    typeof numValue !== "number" ||
    !Number.isFinite(numValue) ||
    numValue % 1 !== 0
  ) {
    throw new Error(`${name} value is invalid`);
  }

  if (numValue < 0) {
    throw new Error(`${name} value must be unsigned`);
  }

  if (!isValidFunction || isValidFunction(numValue, name)) {
    return numValue;
  }

  throw new Error(`${name} value is invalid`);
}
/**
 * Converts a string amount to an XDR Int64 value (scaled by 10^7).
 *
 * @param value - the amount as a string
 */
export function toXDRAmount(value: string): xdr.Int64 {
  const amount = new BigNumber(value).times(ONE);
  return xdr.Int64.fromString(amount.toString());
}

/**
 * Converts an XDR Int64 amount to a decimal string (divided by 10^7).
 *
 * @param value - the XDR amount
 */
export function fromXDRAmount(value: xdr.Int64): string {
  return new BigNumber(value.toString()).div(ONE).toFixed(7);
}

/**
 * Converts an XDR Price (n/d) to a decimal string.
 *
 * @param price - the XDR price object
 */
export function fromXDRPrice(price: xdr.Price): string {
  const n = new BigNumber(price.n());
  return n.div(new BigNumber(price.d())).toString();
}

/**
 * Converts a number, string, or `{n, d}` object to an XDR Price.
 *
 * @param price - the price as a number, string, or `{n, d}` fraction
 */
export function toXDRPrice(
  price: BigNumber | number | string | { n: number; d: number },
): xdr.Price {
  let xdrObject: xdr.Price;

  if (typeof price === "object" && "n" in price && "d" in price) {
    xdrObject = new xdr.Price(price);
  } else {
    const priceBN = new BigNumber(price);
    if (!priceBN.gt(0) || !priceBN.isFinite()) {
      throw new Error("price must be positive");
    }
    const approx = best_r(price);
    xdrObject = new xdr.Price({
      n: parseInt(String(approx[0]), 10),
      d: parseInt(String(approx[1]), 10),
    });
  }

  if (xdrObject.n() < 0 || xdrObject.d() <= 0) {
    throw new Error("price must be positive");
  }

  return xdrObject;
}

/**
 * Validates that a given amount is possible for a Stellar asset.
 *
 * Specifically, this means that the amount is well, a valid number, but also
 * that it is within the int64 range and has no more than 7 decimal levels of
 * precision.
 *
 * Note that while smart contracts allow larger amounts, this is oriented
 * towards validating the standard Stellar operations.
 *
 * @param value - the amount to validate
 * @param allowZero - optionally, whether or not zero is valid (default: no)
 */
export function isValidAmount(value: unknown, allowZero = false): boolean {
  if (typeof value !== "string") {
    return false;
  }

  let amount;

  try {
    amount = new BigNumber(value);
  } catch (e) {
    return false;
  }

  if (
    // == 0
    (!allowZero && amount.isZero()) ||
    // < 0
    amount.isNegative() ||
    // > Max value
    amount.times(ONE).gt(new BigNumber(MAX_INT64).toString()) ||
    // Decimal places (max 7)
    (amount.decimalPlaces() ?? 0) > 7 ||
    // NaN or Infinity
    amount.isNaN() ||
    !amount.isFinite()
  ) {
    return false;
  }

  return true;
}

/** Returns a standard error message for invalid amount arguments. */
export function constructAmountRequirementsError(arg: string): string {
  return `${arg} argument must be of type String, represent a positive number and have at most 7 digits after the decimal`;
}
