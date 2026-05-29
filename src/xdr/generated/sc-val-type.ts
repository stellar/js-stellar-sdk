import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ScValTypeWire = number;

export type ScValTypeName =
  | "scvBool"
  | "scvVoid"
  | "scvError"
  | "scvU32"
  | "scvI32"
  | "scvU64"
  | "scvI64"
  | "scvTimepoint"
  | "scvDuration"
  | "scvU128"
  | "scvI128"
  | "scvU256"
  | "scvI256"
  | "scvBytes"
  | "scvString"
  | "scvSymbol"
  | "scvVec"
  | "scvMap"
  | "scvAddress"
  | "scvContractInstance"
  | "scvLedgerKeyContractInstance"
  | "scvLedgerKeyNonce";

/**
 * ```xdr
 * enum SCValType
 * {
 *     SCV_BOOL = 0,
 *     SCV_VOID = 1,
 *     SCV_ERROR = 2,
 *
 *     // 32 bits is the smallest type in WASM or XDR; no need for u8/u16.
 *     SCV_U32 = 3,
 *     SCV_I32 = 4,
 *
 *     // 64 bits is naturally supported by both WASM and XDR also.
 *     SCV_U64 = 5,
 *     SCV_I64 = 6,
 *
 *     // Time-related u64 subtypes with their own functions and formatting.
 *     SCV_TIMEPOINT = 7,
 *     SCV_DURATION = 8,
 *
 *     // 128 bits is naturally supported by Rust and we use it for Soroban
 *     // fixed-point arithmetic prices / balances / similar "quantities". These
 *     // are represented in XDR as a pair of 2 u64s.
 *     SCV_U128 = 9,
 *     SCV_I128 = 10,
 *
 *     // 256 bits is the size of sha256 output, ed25519 keys, and the EVM machine
 *     // word, so for interop use we include this even though it requires a small
 *     // amount of Rust guest and/or host library code.
 *     SCV_U256 = 11,
 *     SCV_I256 = 12,
 *
 *     // Bytes come in 3 flavors, 2 of which have meaningfully different
 *     // formatting and validity-checking / domain-restriction.
 *     SCV_BYTES = 13,
 *     SCV_STRING = 14,
 *     SCV_SYMBOL = 15,
 *
 *     // Vecs and maps are just polymorphic containers of other ScVals.
 *     SCV_VEC = 16,
 *     SCV_MAP = 17,
 *
 *     // Address is the universal identifier for contracts and classic
 *     // accounts.
 *     SCV_ADDRESS = 18,
 *
 *     // The following are the internal SCVal variants that are not
 *     // exposed to the contracts.
 *     SCV_CONTRACT_INSTANCE = 19,
 *
 *     // SCV_LEDGER_KEY_CONTRACT_INSTANCE and SCV_LEDGER_KEY_NONCE are unique
 *     // symbolic SCVals used as the key for ledger entries for a contract's
 *     // instance and an address' nonce, respectively.
 *     SCV_LEDGER_KEY_CONTRACT_INSTANCE = 20,
 *     SCV_LEDGER_KEY_NONCE = 21
 * };
 * ```
 */
export class ScValType extends EnumValue<ScValTypeName> {
  static readonly scvBool = new ScValType("scvBool", 0);
  static readonly scvVoid = new ScValType("scvVoid", 1);
  static readonly scvError = new ScValType("scvError", 2);
  static readonly scvU32 = new ScValType("scvU32", 3);
  static readonly scvI32 = new ScValType("scvI32", 4);
  static readonly scvU64 = new ScValType("scvU64", 5);
  static readonly scvI64 = new ScValType("scvI64", 6);
  static readonly scvTimepoint = new ScValType("scvTimepoint", 7);
  static readonly scvDuration = new ScValType("scvDuration", 8);
  static readonly scvU128 = new ScValType("scvU128", 9);
  static readonly scvI128 = new ScValType("scvI128", 10);
  static readonly scvU256 = new ScValType("scvU256", 11);
  static readonly scvI256 = new ScValType("scvI256", 12);
  static readonly scvBytes = new ScValType("scvBytes", 13);
  static readonly scvString = new ScValType("scvString", 14);
  static readonly scvSymbol = new ScValType("scvSymbol", 15);
  static readonly scvVec = new ScValType("scvVec", 16);
  static readonly scvMap = new ScValType("scvMap", 17);
  static readonly scvAddress = new ScValType("scvAddress", 18);
  static readonly scvContractInstance = new ScValType(
    "scvContractInstance",
    19,
  );
  static readonly scvLedgerKeyContractInstance = new ScValType(
    "scvLedgerKeyContractInstance",
    20,
  );
  static readonly scvLedgerKeyNonce = new ScValType("scvLedgerKeyNonce", 21);

  static readonly schema = enumType("ScValType", {
    scvBool: 0,
    scvVoid: 1,
    scvError: 2,
    scvU32: 3,
    scvI32: 4,
    scvU64: 5,
    scvI64: 6,
    scvTimepoint: 7,
    scvDuration: 8,
    scvU128: 9,
    scvI128: 10,
    scvU256: 11,
    scvI256: 12,
    scvBytes: 13,
    scvString: 14,
    scvSymbol: 15,
    scvVec: 16,
    scvMap: 17,
    scvAddress: 18,
    scvContractInstance: 19,
    scvLedgerKeyContractInstance: 20,
    scvLedgerKeyNonce: 21,
  });

  static fromValue(value: number): ScValType {
    return enumFromValue("ScValType", ScValType.schema, ScValType, value);
  }

  static fromName(name: ScValTypeName): ScValType {
    return enumFromName("ScValType", ScValType, name);
  }

  static fromXdrObject(wire: number): ScValType {
    return ScValType.fromValue(wire);
  }
}
