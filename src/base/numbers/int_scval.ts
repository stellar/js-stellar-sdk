import type { ScVal } from "../../xdr/index.js";
import {
  check128Parts,
  check256Parts,
  checkBigInt,
  partsTo128BigInt,
  partsTo256BigInt,
} from "../../xdr/values/bigint-parts.js";

/**
 * Converts an integer `ScVal` to a bigint. Internal so SDK code does not depend
 * on the deprecated public `scValToBigInt()`.
 *
 * @throws a `TypeError` if `scv` is not an integer, or an `XdrError` if its
 *   value is out of range for its type
 */
export function intScValToBigInt(scv: ScVal): bigint {
  switch (scv.type) {
    case "scvU32":
    case "scvI32":
      return BigInt(scv.value);

    case "scvU64":
    case "scvTimepoint":
    case "scvDuration":
      return checkBigInt(scv.value, false, 64, scv.type);

    case "scvI64":
      return checkBigInt(scv.value, true, 64, scv.type);

    // Read the fields with this module's helpers rather than calling
    // `value.toBigInt()`: parts from an older copy of the SDK lack that method.
    case "scvU128":
      return partsTo128BigInt(
        check128Parts(scv.value, false, "Uint128Parts"),
        false,
      );

    case "scvI128":
      return partsTo128BigInt(
        check128Parts(scv.value, true, "Int128Parts"),
        true,
      );

    case "scvU256":
      return partsTo256BigInt(
        check256Parts(scv.value, false, "Uint256Parts"),
        false,
      );

    case "scvI256":
      return partsTo256BigInt(
        check256Parts(scv.value, true, "Int256Parts"),
        true,
      );

    default:
      throw TypeError(`expected integer type, got ${scv.type}`);
  }
}
