import xdr from "../xdr.js";
import { XdrLargeInt, type ScIntType } from "./xdr_large_int.js";

export { Uint128 } from "./uint128.js";
export { Uint256 } from "./uint256.js";
export { Int128 } from "./int128.js";
export { Int256 } from "./int256.js";
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
 * @throws if the `scv` input value doesn't represent an integer
 */
export function scValToBigInt(scv: xdr.ScVal): bigint {
  const switchName = scv.switch().name;
  const scIntType = XdrLargeInt.getType(switchName);
  const value = scv.value();

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
      return new XdrLargeInt(
        scIntType,
        value as xdr.Int64 | xdr.Uint64,
      ).toBigInt();

    case "scvU128":
    case "scvI128": {
      if (scIntType === undefined) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const int128Value = value as xdr.Int128Parts | xdr.UInt128Parts;
      return new XdrLargeInt(scIntType, [
        int128Value.lo(),
        int128Value.hi(),
      ]).toBigInt();
    }

    case "scvU256":
    case "scvI256": {
      if (scIntType === undefined) {
        throw TypeError(`invalid integer type for ${switchName}`);
      }
      const int256Value = value as xdr.Int256Parts | xdr.UInt256Parts;
      return new XdrLargeInt(scIntType, [
        int256Value.loLo(),
        int256Value.loHi(),
        int256Value.hiLo(),
        int256Value.hiHi(),
      ]).toBigInt();
    }

    default:
      throw TypeError(`expected integer type, got ${switchName}`);
  }
}
