/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import { array } from "../types/array.js";
import { lazy } from "../types/lazy.js";
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { bool } from "../types/bool.js";
import { uint32 } from "../types/uint32.js";
import { int32 } from "../types/int32.js";
import { uint64 } from "../types/uint64.js";
import { int64 } from "../types/int64.js";
import { string as string_ } from "../types/string.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ContractExecutable,
  type ContractExecutableWire,
} from "./contract-executable.js";
import { ScValType } from "./sc-val-type.js";
import { ScError, type ScErrorWire } from "./sc-error.js";
import { Uint128Parts, type Uint128PartsWire } from "./uint128-parts.js";
import { Int128Parts, type Int128PartsWire } from "./int128-parts.js";
import { Uint256Parts, type Uint256PartsWire } from "./uint256-parts.js";
import { Int256Parts, type Int256PartsWire } from "./int256-parts.js";
import { ScBytes, type ScBytesWire } from "./sc-bytes.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScNonceKey, type ScNonceKeyWire } from "./sc-nonce-key.js";

export interface ScContractInstanceWire {
  executable: ContractExecutableWire;
  storage: ScMapEntryWire[] | null;
}

/**
 * ```xdr
 * struct SCContractInstance {
 *     ContractExecutable executable;
 *     SCMap* storage;
 * };
 * ```
 */
export class ScContractInstance extends XdrValue {
  readonly executable: ContractExecutable;
  readonly storage: ScMapEntry[] | null;

  static readonly schema: XdrType<ScContractInstanceWire> = struct(
    "ScContractInstance",
    {
      executable: ContractExecutable.schema,
      storage: option(
        array(
          lazy(() => ScMapEntry.schema),
          UNBOUNDED_MAX_LENGTH,
        ),
      ),
    },
  );

  constructor(input: {
    executable: ContractExecutable;
    storage: ScMapEntry[] | null;
  }) {
    super();
    this.executable = input.executable;
    this.storage = input.storage;
  }

  toXdrObject(): ScContractInstanceWire {
    return {
      executable: this.executable.toXdrObject(),
      storage:
        this.storage === null ? null : this.storage.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScContractInstanceWire): ScContractInstance {
    return new ScContractInstance({
      executable: ContractExecutable.fromXdrObject(wire.executable),
      storage:
        wire.storage === null
          ? null
          : wire.storage.map((w) => ScMapEntry.fromXdrObject(w)),
    });
  }
}

export interface ScMapEntryWire {
  key: ScValWire;
  val: ScValWire;
}

/**
 * ```xdr
 * struct SCMapEntry
 * {
 *     SCVal key;
 *     SCVal val;
 * };
 * ```
 */
export class ScMapEntry extends XdrValue {
  readonly key: ScVal;
  readonly val: ScVal;

  static readonly schema: XdrType<ScMapEntryWire> = struct("ScMapEntry", {
    key: lazy(() => ScVal.schema),
    val: lazy(() => ScVal.schema),
  });

  constructor(input: { key: ScVal; val: ScVal }) {
    super();
    this.key = input.key;
    this.val = input.val;
  }

  toXdrObject(): ScMapEntryWire {
    return {
      key: this.key.toXdrObject(),
      val: this.val.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScMapEntryWire): ScMapEntry {
    return new ScMapEntry({
      key: ScVal.fromXdrObject(wire.key),
      val: ScVal.fromXdrObject(wire.val),
    });
  }
}

export type ScValWire =
  | { type: 0; b: boolean }
  | { type: 1 }
  | { type: 2; error: ScErrorWire }
  | { type: 3; u32: number }
  | { type: 4; i32: number }
  | { type: 5; u64: bigint }
  | { type: 6; i64: bigint }
  | { type: 7; timepoint: bigint }
  | { type: 8; duration: bigint }
  | { type: 9; u128: Uint128PartsWire }
  | { type: 10; i128: Int128PartsWire }
  | { type: 11; u256: Uint256PartsWire }
  | { type: 12; i256: Int256PartsWire }
  | { type: 13; bytes: ScBytesWire }
  | { type: 14; str: string }
  | { type: 15; sym: string }
  | { type: 16; vec: ScValWire[] | null }
  | { type: 17; map: ScMapEntryWire[] | null }
  | { type: 18; address: ScAddressWire }
  | { type: 19; instance: ScContractInstanceWire }
  | { type: 20 }
  | { type: 21; nonceKey: ScNonceKeyWire };

export type ScValVariantName =
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
 * union SCVal switch (SCValType type)
 * {
 *
 * case SCV_BOOL:
 *     bool b;
 * case SCV_VOID:
 *     void;
 * case SCV_ERROR:
 *     SCError error;
 *
 * case SCV_U32:
 *     uint32 u32;
 * case SCV_I32:
 *     int32 i32;
 *
 * case SCV_U64:
 *     uint64 u64;
 * case SCV_I64:
 *     int64 i64;
 * case SCV_TIMEPOINT:
 *     TimePoint timepoint;
 * case SCV_DURATION:
 *     Duration duration;
 *
 * case SCV_U128:
 *     UInt128Parts u128;
 * case SCV_I128:
 *     Int128Parts i128;
 *
 * case SCV_U256:
 *     UInt256Parts u256;
 * case SCV_I256:
 *     Int256Parts i256;
 *
 * case SCV_BYTES:
 *     SCBytes bytes;
 * case SCV_STRING:
 *     SCString str;
 * case SCV_SYMBOL:
 *     SCSymbol sym;
 *
 * // Vec and Map are recursive so need to live
 * // behind an option, due to xdrpp limitations.
 * case SCV_VEC:
 *     SCVec *vec;
 * case SCV_MAP:
 *     SCMap *map;
 *
 * case SCV_ADDRESS:
 *     SCAddress address;
 *
 * // Special SCVals reserved for system-constructed contract-data
 * // ledger keys, not generally usable elsewhere.
 * case SCV_CONTRACT_INSTANCE:
 *     SCContractInstance instance;
 * case SCV_LEDGER_KEY_CONTRACT_INSTANCE:
 *     void;
 * case SCV_LEDGER_KEY_NONCE:
 *     SCNonceKey nonce_key;
 * };
 * ```
 */
abstract class ScValBase extends XdrValue {
  abstract readonly type: ScValVariantName;

  static readonly schema: XdrType<ScValWire> = union("ScVal", {
    switchOn: ScValType.schema,
    cases: [
      case_("scvBool", 0, field("b", bool())),
      case_("scvVoid", 1, voidType()),
      case_("scvError", 2, field("error", ScError.schema)),
      case_("scvU32", 3, field("u32", uint32())),
      case_("scvI32", 4, field("i32", int32())),
      case_("scvU64", 5, field("u64", uint64())),
      case_("scvI64", 6, field("i64", int64())),
      case_("scvTimepoint", 7, field("timepoint", uint64())),
      case_("scvDuration", 8, field("duration", uint64())),
      case_("scvU128", 9, field("u128", Uint128Parts.schema)),
      case_("scvI128", 10, field("i128", Int128Parts.schema)),
      case_("scvU256", 11, field("u256", Uint256Parts.schema)),
      case_("scvI256", 12, field("i256", Int256Parts.schema)),
      case_("scvBytes", 13, field("bytes", ScBytes.schema)),
      case_("scvString", 14, field("str", string_(UNBOUNDED_MAX_LENGTH))),
      case_("scvSymbol", 15, field("sym", string_(32))),
      case_(
        "scvVec",
        16,
        field(
          "vec",
          option(
            array(
              lazy(() => ScVal.schema),
              UNBOUNDED_MAX_LENGTH,
            ),
          ),
        ),
      ),
      case_(
        "scvMap",
        17,
        field(
          "map",
          option(
            array(
              lazy(() => ScMapEntry.schema),
              UNBOUNDED_MAX_LENGTH,
            ),
          ),
        ),
      ),
      case_("scvAddress", 18, field("address", ScAddress.schema)),
      case_(
        "scvContractInstance",
        19,
        field(
          "instance",
          lazy(() => ScContractInstance.schema),
        ),
      ),
      case_("scvLedgerKeyContractInstance", 20, voidType()),
      case_("scvLedgerKeyNonce", 21, field("nonceKey", ScNonceKey.schema)),
    ],
  });

  static scvBool(b: boolean): ScValBool {
    return new ScValBool(b);
  }

  static scvVoid(): ScValVoid {
    return new ScValVoid();
  }

  static scvError(error: ScError): ScValError {
    return new ScValError(error);
  }

  static scvU32(u32: number): ScValU32 {
    return new ScValU32(u32);
  }

  static scvI32(i32: number): ScValI32 {
    return new ScValI32(i32);
  }

  static scvU64(u64: bigint): ScValU64 {
    return new ScValU64(u64);
  }

  static scvI64(i64: bigint): ScValI64 {
    return new ScValI64(i64);
  }

  static scvTimepoint(timepoint: bigint): ScValTimepoint {
    return new ScValTimepoint(timepoint);
  }

  static scvDuration(duration: bigint): ScValDuration {
    return new ScValDuration(duration);
  }

  static scvU128(u128: Uint128Parts): ScValU128 {
    return new ScValU128(u128);
  }

  static scvI128(i128: Int128Parts): ScValI128 {
    return new ScValI128(i128);
  }

  static scvU256(u256: Uint256Parts): ScValU256 {
    return new ScValU256(u256);
  }

  static scvI256(i256: Int256Parts): ScValI256 {
    return new ScValI256(i256);
  }

  static scvBytes(bytes: ScBytes): ScValBytes {
    return new ScValBytes(bytes);
  }

  static scvString(str: string): ScValString {
    return new ScValString(str);
  }

  static scvSymbol(sym: string): ScValSymbol {
    return new ScValSymbol(sym);
  }

  static scvVec(vec: ScVal[] | null): ScValVec {
    return new ScValVec(vec);
  }

  static scvMap(map: ScMapEntry[] | null): ScValMap {
    return new ScValMap(map);
  }

  static scvAddress(address: ScAddress): ScValAddress {
    return new ScValAddress(address);
  }

  static scvContractInstance(
    instance: ScContractInstance,
  ): ScValContractInstance {
    return new ScValContractInstance(instance);
  }

  static scvLedgerKeyContractInstance(): ScValLedgerKeyContractInstance {
    return new ScValLedgerKeyContractInstance();
  }

  static scvLedgerKeyNonce(nonceKey: ScNonceKey): ScValLedgerKeyNonce {
    return new ScValLedgerKeyNonce(nonceKey);
  }

  static fromXdrObject(wire: ScValWire): ScVal {
    switch (wire.type) {
      case 0:
        return new ScValBool(wire.b);
      case 1:
        return new ScValVoid();
      case 2:
        return new ScValError(ScError.fromXdrObject(wire.error));
      case 3:
        return new ScValU32(wire.u32);
      case 4:
        return new ScValI32(wire.i32);
      case 5:
        return new ScValU64(wire.u64);
      case 6:
        return new ScValI64(wire.i64);
      case 7:
        return new ScValTimepoint(wire.timepoint);
      case 8:
        return new ScValDuration(wire.duration);
      case 9:
        return new ScValU128(Uint128Parts.fromXdrObject(wire.u128));
      case 10:
        return new ScValI128(Int128Parts.fromXdrObject(wire.i128));
      case 11:
        return new ScValU256(Uint256Parts.fromXdrObject(wire.u256));
      case 12:
        return new ScValI256(Int256Parts.fromXdrObject(wire.i256));
      case 13:
        return new ScValBytes(ScBytes.fromXdrObject(wire.bytes));
      case 14:
        return new ScValString(wire.str);
      case 15:
        return new ScValSymbol(wire.sym);
      case 16:
        return new ScValVec(
          wire.vec === null
            ? null
            : wire.vec.map((w) => ScVal.fromXdrObject(w)),
        );
      case 17:
        return new ScValMap(
          wire.map === null
            ? null
            : wire.map.map((w) => ScMapEntry.fromXdrObject(w)),
        );
      case 18:
        return new ScValAddress(ScAddress.fromXdrObject(wire.address));
      case 19:
        return new ScValContractInstance(
          ScContractInstance.fromXdrObject(wire.instance),
        );
      case 20:
        return new ScValLedgerKeyContractInstance();
      case 21:
        return new ScValLedgerKeyNonce(ScNonceKey.fromXdrObject(wire.nonceKey));
    }
  }

  abstract toXdrObject(): ScValWire;
}

export class ScValBool extends ScValBase {
  readonly type = "scvBool" as const;
  readonly b: boolean;

  constructor(b: boolean) {
    super();
    this.b = b;
  }

  get value(): boolean {
    return this.b;
  }

  toXdrObject(): Extract<ScValWire, { type: 0 }> {
    return { type: 0, b: this.b };
  }
}

export class ScValVoid extends ScValBase {
  readonly type = "scvVoid" as const;

  toXdrObject(): Extract<ScValWire, { type: 1 }> {
    return { type: 1 };
  }
}

export class ScValError extends ScValBase {
  readonly type = "scvError" as const;
  readonly error: ScError;

  constructor(error: ScError) {
    super();
    this.error = error;
  }

  get value(): ScError {
    return this.error;
  }

  toXdrObject(): Extract<ScValWire, { type: 2 }> {
    return { type: 2, error: this.error.toXdrObject() };
  }
}

export class ScValU32 extends ScValBase {
  readonly type = "scvU32" as const;
  readonly u32: number;

  constructor(u32: number) {
    super();
    this.u32 = u32;
  }

  get value(): number {
    return this.u32;
  }

  toXdrObject(): Extract<ScValWire, { type: 3 }> {
    return { type: 3, u32: this.u32 };
  }
}

export class ScValI32 extends ScValBase {
  readonly type = "scvI32" as const;
  readonly i32: number;

  constructor(i32: number) {
    super();
    this.i32 = i32;
  }

  get value(): number {
    return this.i32;
  }

  toXdrObject(): Extract<ScValWire, { type: 4 }> {
    return { type: 4, i32: this.i32 };
  }
}

export class ScValU64 extends ScValBase {
  readonly type = "scvU64" as const;
  readonly u64: bigint;

  constructor(u64: bigint) {
    super();
    this.u64 = u64;
  }

  get value(): bigint {
    return this.u64;
  }

  toXdrObject(): Extract<ScValWire, { type: 5 }> {
    return { type: 5, u64: this.u64 };
  }
}

export class ScValI64 extends ScValBase {
  readonly type = "scvI64" as const;
  readonly i64: bigint;

  constructor(i64: bigint) {
    super();
    this.i64 = i64;
  }

  get value(): bigint {
    return this.i64;
  }

  toXdrObject(): Extract<ScValWire, { type: 6 }> {
    return { type: 6, i64: this.i64 };
  }
}

export class ScValTimepoint extends ScValBase {
  readonly type = "scvTimepoint" as const;
  readonly timepoint: bigint;

  constructor(timepoint: bigint) {
    super();
    this.timepoint = timepoint;
  }

  get value(): bigint {
    return this.timepoint;
  }

  toXdrObject(): Extract<ScValWire, { type: 7 }> {
    return { type: 7, timepoint: this.timepoint };
  }
}

export class ScValDuration extends ScValBase {
  readonly type = "scvDuration" as const;
  readonly duration: bigint;

  constructor(duration: bigint) {
    super();
    this.duration = duration;
  }

  get value(): bigint {
    return this.duration;
  }

  toXdrObject(): Extract<ScValWire, { type: 8 }> {
    return { type: 8, duration: this.duration };
  }
}

export class ScValU128 extends ScValBase {
  readonly type = "scvU128" as const;
  readonly u128: Uint128Parts;

  constructor(u128: Uint128Parts) {
    super();
    this.u128 = u128;
  }

  get value(): Uint128Parts {
    return this.u128;
  }

  toXdrObject(): Extract<ScValWire, { type: 9 }> {
    return { type: 9, u128: this.u128.toXdrObject() };
  }
}

export class ScValI128 extends ScValBase {
  readonly type = "scvI128" as const;
  readonly i128: Int128Parts;

  constructor(i128: Int128Parts) {
    super();
    this.i128 = i128;
  }

  get value(): Int128Parts {
    return this.i128;
  }

  toXdrObject(): Extract<ScValWire, { type: 10 }> {
    return { type: 10, i128: this.i128.toXdrObject() };
  }
}

export class ScValU256 extends ScValBase {
  readonly type = "scvU256" as const;
  readonly u256: Uint256Parts;

  constructor(u256: Uint256Parts) {
    super();
    this.u256 = u256;
  }

  get value(): Uint256Parts {
    return this.u256;
  }

  toXdrObject(): Extract<ScValWire, { type: 11 }> {
    return { type: 11, u256: this.u256.toXdrObject() };
  }
}

export class ScValI256 extends ScValBase {
  readonly type = "scvI256" as const;
  readonly i256: Int256Parts;

  constructor(i256: Int256Parts) {
    super();
    this.i256 = i256;
  }

  get value(): Int256Parts {
    return this.i256;
  }

  toXdrObject(): Extract<ScValWire, { type: 12 }> {
    return { type: 12, i256: this.i256.toXdrObject() };
  }
}

export class ScValBytes extends ScValBase {
  readonly type = "scvBytes" as const;
  readonly bytes: ScBytes;

  constructor(bytes: ScBytes) {
    super();
    this.bytes = bytes;
  }

  get value(): ScBytes {
    return this.bytes;
  }

  toXdrObject(): Extract<ScValWire, { type: 13 }> {
    return { type: 13, bytes: this.bytes.toXdrObject() };
  }
}

export class ScValString extends ScValBase {
  readonly type = "scvString" as const;
  readonly str: string;

  constructor(str: string) {
    super();
    this.str = str;
  }

  get value(): string {
    return this.str;
  }

  toXdrObject(): Extract<ScValWire, { type: 14 }> {
    return { type: 14, str: this.str };
  }
}

export class ScValSymbol extends ScValBase {
  readonly type = "scvSymbol" as const;
  readonly sym: string;

  constructor(sym: string) {
    super();
    this.sym = sym;
  }

  get value(): string {
    return this.sym;
  }

  toXdrObject(): Extract<ScValWire, { type: 15 }> {
    return { type: 15, sym: this.sym };
  }
}

export class ScValVec extends ScValBase {
  readonly type = "scvVec" as const;
  readonly vec: ScVal[] | null;

  constructor(vec: ScVal[] | null) {
    super();
    this.vec = vec;
  }

  get value(): ScVal[] | null {
    return this.vec;
  }

  toXdrObject(): Extract<ScValWire, { type: 16 }> {
    return {
      type: 16,
      vec: this.vec === null ? null : this.vec.map((v) => v.toXdrObject()),
    };
  }
}

export class ScValMap extends ScValBase {
  readonly type = "scvMap" as const;
  readonly map: ScMapEntry[] | null;

  constructor(map: ScMapEntry[] | null) {
    super();
    this.map = map;
  }

  get value(): ScMapEntry[] | null {
    return this.map;
  }

  toXdrObject(): Extract<ScValWire, { type: 17 }> {
    return {
      type: 17,
      map: this.map === null ? null : this.map.map((v) => v.toXdrObject()),
    };
  }
}

export class ScValAddress extends ScValBase {
  readonly type = "scvAddress" as const;
  readonly address: ScAddress;

  constructor(address: ScAddress) {
    super();
    this.address = address;
  }

  get value(): ScAddress {
    return this.address;
  }

  toXdrObject(): Extract<ScValWire, { type: 18 }> {
    return { type: 18, address: this.address.toXdrObject() };
  }
}

export class ScValContractInstance extends ScValBase {
  readonly type = "scvContractInstance" as const;
  readonly instance: ScContractInstance;

  constructor(instance: ScContractInstance) {
    super();
    this.instance = instance;
  }

  get value(): ScContractInstance {
    return this.instance;
  }

  toXdrObject(): Extract<ScValWire, { type: 19 }> {
    return { type: 19, instance: this.instance.toXdrObject() };
  }
}

export class ScValLedgerKeyContractInstance extends ScValBase {
  readonly type = "scvLedgerKeyContractInstance" as const;

  toXdrObject(): Extract<ScValWire, { type: 20 }> {
    return { type: 20 };
  }
}

export class ScValLedgerKeyNonce extends ScValBase {
  readonly type = "scvLedgerKeyNonce" as const;
  readonly nonceKey: ScNonceKey;

  constructor(nonceKey: ScNonceKey) {
    super();
    this.nonceKey = nonceKey;
  }

  get value(): ScNonceKey {
    return this.nonceKey;
  }

  toXdrObject(): Extract<ScValWire, { type: 21 }> {
    return { type: 21, nonceKey: this.nonceKey.toXdrObject() };
  }
}

export type ScVal =
  | ScValBool
  | ScValVoid
  | ScValError
  | ScValU32
  | ScValI32
  | ScValU64
  | ScValI64
  | ScValTimepoint
  | ScValDuration
  | ScValU128
  | ScValI128
  | ScValU256
  | ScValI256
  | ScValBytes
  | ScValString
  | ScValSymbol
  | ScValVec
  | ScValMap
  | ScValAddress
  | ScValContractInstance
  | ScValLedgerKeyContractInstance
  | ScValLedgerKeyNonce;
export const ScVal = ScValBase;
