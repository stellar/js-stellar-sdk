import { ScVal } from "../generated/index.js";

export type ScIntType =
  | "duration"
  | "i64"
  | "i128"
  | "i256"
  | "timepoint"
  | "u64"
  | "u128"
  | "u256";
/**
 * Transforms an opaque {@link ScVal} into a native bigint, if possible.
 *
 * If you then want to use this in the abstractions provided by this module,
 * you can pass it to the constructor of {@link XdrLargeInt}.
 *
 * @example
 * let scv = contract.call("add", x, y); // assume it returns an ScVal
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

  switch (scv.type) {
    case "scvU32":
      return BigInt(scv.u32);
    case "scvI32":
      return BigInt(scv.i32);

    case "scvU64":
      return scv.u64;
    case "scvI64":
      return scv.i64;
    case "scvTimepoint":
      return scv.timepoint;
    case "scvDuration":
      return scv.duration;

    case "scvU128":
      return scv.u128;
    case "scvI128": {
      return scv.i128;
    }

    case "scvU256":
      return scv.u256;
    case "scvI256": {
      return scv.i256;
    }

    default:
      throw TypeError(`expected integer type, got ${switchName}`);
  }
}
