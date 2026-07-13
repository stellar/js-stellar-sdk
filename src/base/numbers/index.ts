import { ScVal } from "../../xdr/index.js";
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
 * let scv = contract.call("add", x, y); // assume it returns an xdr.ScVal
 * let bigi = scValToBigInt(scv);
 *
 * new ScInt(bigi);               // if you don't care about types, and
 * new XdrLargeInt('i128', bigi); // if you do
 *
 * @param scv - the XDR smart contract value to convert
 *
 * @throws {TypeError} if the `scv` input value doesn't represent an integer
 */
export function scValToBigInt(scv: ScVal): bigint {
  const switchName = scv.type;
  const scIntType = XdrLargeInt.getType(switchName);
  const value = "value" in scv ? scv.value : null;

  if (value === null) {
    throw TypeError(`unexpected null value for ${switchName}`);
  }

  switch (switchName) {
    case "scvU32":
    case "scvI32":
      return BigInt(value as number);

    case "scvU64":
    case "scvI64":
    case "scvTimepoint":
    case "scvDuration":
      if (scIntType === undefined) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      return new XdrLargeInt(scIntType, value as bigint).toBigInt();

    case "scvU128":
    case "scvI128": {
      if (scIntType === undefined) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const parts = value as { hi: bigint; lo: bigint };
      // XdrLargeInt arrays are little-endian (parts[0] = least significant).
      return new XdrLargeInt(scIntType, [parts.lo, parts.hi]).toBigInt();
    }

    case "scvU256":
    case "scvI256": {
      if (scIntType === undefined) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const parts = value as {
        hiHi: bigint;
        hiLo: bigint;
        loHi: bigint;
        loLo: bigint;
      };
      // Little-endian: loLo (least significant) first, hiHi (most significant) last.
      return new XdrLargeInt(scIntType, [
        parts.loLo,
        parts.loHi,
        parts.hiLo,
        parts.hiHi,
      ]).toBigInt();
    }

    default:
      throw TypeError(`expected integer type, got ${switchName}`);
  }
}
