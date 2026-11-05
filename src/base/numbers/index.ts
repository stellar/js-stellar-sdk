import { ScVal } from "../../xdr/index.js";
import {
  check128Parts,
  check256Parts,
  checkBigInt,
  partsTo128BigInt,
  partsTo256BigInt,
} from "../../xdr/values/bigint-parts.js";
import { XdrLargeInt, type ScIntType } from "./xdr_large_int.js";

// Re-export the new-layer DX wide-int wrappers under their familiar names.
// These replace the legacy `LargeInt`-based classes that used to live here.
export { Uint128, Int128, Uint256, Int256 } from "../../xdr/index.js";
export { ScInt } from "./sc_int.js";
export { XdrLargeInt };
export type { ScIntType };

/**
 * Transforms an opaque {@link xdr.ScVal} into a native bigint, if possible.
 *
 * If you then want to use this in the abstractions provided by this module,
 * you can pass it to the constructor of {@link XdrLargeInt}.
 *
 * @example
 * ```ts
 * let scv = contract.call("add", x, y); // assume it returns an xdr.ScVal
 * let bigi = scValToBigInt(scv);
 *
 * new ScInt(bigi);               // if you don't care about types, and
 * new XdrLargeInt('i128', bigi); // if you do
 * ```
 *
 * @param scv - the XDR smart contract value to convert
 *
 * @throws a `TypeError` if the `scv` input value doesn't represent an integer,
 *   or an `XdrError` if its value is out of range for its type
 */
export function scValToBigInt(scv: ScVal): bigint {
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
