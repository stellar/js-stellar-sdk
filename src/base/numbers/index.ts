import type { ScVal } from "../../xdr/index.js";
import { intScValToBigInt } from "./int_scval.js";
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
 * @deprecated Use `scValToNative()`, which returns a bigint for 64-bit and
 * wider integers, or read `scv.value` (call `.toBigInt()` on 128- and 256-bit
 * parts). Will be removed in the next major release.
 *
 * @param scv - the XDR smart contract value to convert
 *
 * @throws a `TypeError` if the `scv` input value doesn't represent an integer,
 *   or an `XdrError` if its value is out of range for its type
 */
export function scValToBigInt(scv: ScVal): bigint {
  return intScValToBigInt(scv);
}
