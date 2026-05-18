/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { lazy } from "../types/lazy.js";
import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecType } from "./sc-spec-type.js";
import {
  ScSpecTypeBytesN,
  type ScSpecTypeBytesNWire,
} from "./sc-spec-type-bytes-n.js";
import { ScSpecTypeUdt, type ScSpecTypeUdtWire } from "./sc-spec-type-udt.js";

export type ScSpecTypeDefWire =
  | { type: 0 }
  | { type: 1 }
  | { type: 2 }
  | { type: 3 }
  | { type: 4 }
  | { type: 5 }
  | { type: 6 }
  | { type: 7 }
  | { type: 8 }
  | { type: 9 }
  | { type: 10 }
  | { type: 11 }
  | { type: 12 }
  | { type: 13 }
  | { type: 14 }
  | { type: 16 }
  | { type: 17 }
  | { type: 19 }
  | { type: 20 }
  | { type: 1000; option: ScSpecTypeOptionWire }
  | { type: 1001; result: ScSpecTypeResultWire }
  | { type: 1002; vec: ScSpecTypeVecWire }
  | { type: 1004; map: ScSpecTypeMapWire }
  | { type: 1005; tuple: ScSpecTypeTupleWire }
  | { type: 1006; bytesN: ScSpecTypeBytesNWire }
  | { type: 2000; udt: ScSpecTypeUdtWire };

export type ScSpecTypeDefVariantName =
  | "scSpecTypeVal"
  | "scSpecTypeBool"
  | "scSpecTypeVoid"
  | "scSpecTypeError"
  | "scSpecTypeU32"
  | "scSpecTypeI32"
  | "scSpecTypeU64"
  | "scSpecTypeI64"
  | "scSpecTypeTimepoint"
  | "scSpecTypeDuration"
  | "scSpecTypeU128"
  | "scSpecTypeI128"
  | "scSpecTypeU256"
  | "scSpecTypeI256"
  | "scSpecTypeBytes"
  | "scSpecTypeString"
  | "scSpecTypeSymbol"
  | "scSpecTypeAddress"
  | "scSpecTypeMuxedAddress"
  | "scSpecTypeOption"
  | "scSpecTypeResult"
  | "scSpecTypeVec"
  | "scSpecTypeMap"
  | "scSpecTypeTuple"
  | "scSpecTypeBytesN"
  | "scSpecTypeUdt";

/**
 * ```xdr
 * union SCSpecTypeDef switch (SCSpecType type)
 * {
 * case SC_SPEC_TYPE_VAL:
 * case SC_SPEC_TYPE_BOOL:
 * case SC_SPEC_TYPE_VOID:
 * case SC_SPEC_TYPE_ERROR:
 * case SC_SPEC_TYPE_U32:
 * case SC_SPEC_TYPE_I32:
 * case SC_SPEC_TYPE_U64:
 * case SC_SPEC_TYPE_I64:
 * case SC_SPEC_TYPE_TIMEPOINT:
 * case SC_SPEC_TYPE_DURATION:
 * case SC_SPEC_TYPE_U128:
 * case SC_SPEC_TYPE_I128:
 * case SC_SPEC_TYPE_U256:
 * case SC_SPEC_TYPE_I256:
 * case SC_SPEC_TYPE_BYTES:
 * case SC_SPEC_TYPE_STRING:
 * case SC_SPEC_TYPE_SYMBOL:
 * case SC_SPEC_TYPE_ADDRESS:
 * case SC_SPEC_TYPE_MUXED_ADDRESS:
 *     void;
 * case SC_SPEC_TYPE_OPTION:
 *     SCSpecTypeOption option;
 * case SC_SPEC_TYPE_RESULT:
 *     SCSpecTypeResult result;
 * case SC_SPEC_TYPE_VEC:
 *     SCSpecTypeVec vec;
 * case SC_SPEC_TYPE_MAP:
 *     SCSpecTypeMap map;
 * case SC_SPEC_TYPE_TUPLE:
 *     SCSpecTypeTuple tuple;
 * case SC_SPEC_TYPE_BYTES_N:
 *     SCSpecTypeBytesN bytesN;
 * case SC_SPEC_TYPE_UDT:
 *     SCSpecTypeUDT udt;
 * };
 * ```
 */
abstract class ScSpecTypeDefBase extends XdrValue {
  abstract readonly type: ScSpecTypeDefVariantName;

  static readonly schema: XdrType<ScSpecTypeDefWire> = union("ScSpecTypeDef", {
    switchOn: ScSpecType.schema,
    cases: [
      case_("scSpecTypeVal", 0, voidType()),
      case_("scSpecTypeBool", 1, voidType()),
      case_("scSpecTypeVoid", 2, voidType()),
      case_("scSpecTypeError", 3, voidType()),
      case_("scSpecTypeU32", 4, voidType()),
      case_("scSpecTypeI32", 5, voidType()),
      case_("scSpecTypeU64", 6, voidType()),
      case_("scSpecTypeI64", 7, voidType()),
      case_("scSpecTypeTimepoint", 8, voidType()),
      case_("scSpecTypeDuration", 9, voidType()),
      case_("scSpecTypeU128", 10, voidType()),
      case_("scSpecTypeI128", 11, voidType()),
      case_("scSpecTypeU256", 12, voidType()),
      case_("scSpecTypeI256", 13, voidType()),
      case_("scSpecTypeBytes", 14, voidType()),
      case_("scSpecTypeString", 16, voidType()),
      case_("scSpecTypeSymbol", 17, voidType()),
      case_("scSpecTypeAddress", 19, voidType()),
      case_("scSpecTypeMuxedAddress", 20, voidType()),
      case_(
        "scSpecTypeOption",
        1000,
        field(
          "option",
          lazy(() => ScSpecTypeOption.schema),
        ),
      ),
      case_(
        "scSpecTypeResult",
        1001,
        field(
          "result",
          lazy(() => ScSpecTypeResult.schema),
        ),
      ),
      case_(
        "scSpecTypeVec",
        1002,
        field(
          "vec",
          lazy(() => ScSpecTypeVec.schema),
        ),
      ),
      case_(
        "scSpecTypeMap",
        1004,
        field(
          "map",
          lazy(() => ScSpecTypeMap.schema),
        ),
      ),
      case_(
        "scSpecTypeTuple",
        1005,
        field(
          "tuple",
          lazy(() => ScSpecTypeTuple.schema),
        ),
      ),
      case_("scSpecTypeBytesN", 1006, field("bytesN", ScSpecTypeBytesN.schema)),
      case_("scSpecTypeUdt", 2000, field("udt", ScSpecTypeUdt.schema)),
    ],
  });

  static scSpecTypeVal(): ScSpecTypeDefVal {
    return new ScSpecTypeDefVal();
  }

  static scSpecTypeBool(): ScSpecTypeDefBool {
    return new ScSpecTypeDefBool();
  }

  static scSpecTypeVoid(): ScSpecTypeDefVoid {
    return new ScSpecTypeDefVoid();
  }

  static scSpecTypeError(): ScSpecTypeDefError {
    return new ScSpecTypeDefError();
  }

  static scSpecTypeU32(): ScSpecTypeDefU32 {
    return new ScSpecTypeDefU32();
  }

  static scSpecTypeI32(): ScSpecTypeDefI32 {
    return new ScSpecTypeDefI32();
  }

  static scSpecTypeU64(): ScSpecTypeDefU64 {
    return new ScSpecTypeDefU64();
  }

  static scSpecTypeI64(): ScSpecTypeDefI64 {
    return new ScSpecTypeDefI64();
  }

  static scSpecTypeTimepoint(): ScSpecTypeDefTimepoint {
    return new ScSpecTypeDefTimepoint();
  }

  static scSpecTypeDuration(): ScSpecTypeDefDuration {
    return new ScSpecTypeDefDuration();
  }

  static scSpecTypeU128(): ScSpecTypeDefU128 {
    return new ScSpecTypeDefU128();
  }

  static scSpecTypeI128(): ScSpecTypeDefI128 {
    return new ScSpecTypeDefI128();
  }

  static scSpecTypeU256(): ScSpecTypeDefU256 {
    return new ScSpecTypeDefU256();
  }

  static scSpecTypeI256(): ScSpecTypeDefI256 {
    return new ScSpecTypeDefI256();
  }

  static scSpecTypeBytes(): ScSpecTypeDefBytes {
    return new ScSpecTypeDefBytes();
  }

  static scSpecTypeString(): ScSpecTypeDefString {
    return new ScSpecTypeDefString();
  }

  static scSpecTypeSymbol(): ScSpecTypeDefSymbol {
    return new ScSpecTypeDefSymbol();
  }

  static scSpecTypeAddress(): ScSpecTypeDefAddress {
    return new ScSpecTypeDefAddress();
  }

  static scSpecTypeMuxedAddress(): ScSpecTypeDefMuxedAddress {
    return new ScSpecTypeDefMuxedAddress();
  }

  static scSpecTypeOption(option: ScSpecTypeOption): ScSpecTypeDefOption {
    return new ScSpecTypeDefOption(option);
  }

  static scSpecTypeResult(result: ScSpecTypeResult): ScSpecTypeDefResult {
    return new ScSpecTypeDefResult(result);
  }

  static scSpecTypeVec(vec: ScSpecTypeVec): ScSpecTypeDefVec {
    return new ScSpecTypeDefVec(vec);
  }

  static scSpecTypeMap(map: ScSpecTypeMap): ScSpecTypeDefMap {
    return new ScSpecTypeDefMap(map);
  }

  static scSpecTypeTuple(tuple: ScSpecTypeTuple): ScSpecTypeDefTuple {
    return new ScSpecTypeDefTuple(tuple);
  }

  static scSpecTypeBytesN(bytesN: ScSpecTypeBytesN): ScSpecTypeDefBytesN {
    return new ScSpecTypeDefBytesN(bytesN);
  }

  static scSpecTypeUdt(udt: ScSpecTypeUdt): ScSpecTypeDefUdt {
    return new ScSpecTypeDefUdt(udt);
  }

  static fromXdrObject(wire: ScSpecTypeDefWire): ScSpecTypeDef {
    switch (wire.type) {
      case 0:
        return new ScSpecTypeDefVal();
      case 1:
        return new ScSpecTypeDefBool();
      case 2:
        return new ScSpecTypeDefVoid();
      case 3:
        return new ScSpecTypeDefError();
      case 4:
        return new ScSpecTypeDefU32();
      case 5:
        return new ScSpecTypeDefI32();
      case 6:
        return new ScSpecTypeDefU64();
      case 7:
        return new ScSpecTypeDefI64();
      case 8:
        return new ScSpecTypeDefTimepoint();
      case 9:
        return new ScSpecTypeDefDuration();
      case 10:
        return new ScSpecTypeDefU128();
      case 11:
        return new ScSpecTypeDefI128();
      case 12:
        return new ScSpecTypeDefU256();
      case 13:
        return new ScSpecTypeDefI256();
      case 14:
        return new ScSpecTypeDefBytes();
      case 16:
        return new ScSpecTypeDefString();
      case 17:
        return new ScSpecTypeDefSymbol();
      case 19:
        return new ScSpecTypeDefAddress();
      case 20:
        return new ScSpecTypeDefMuxedAddress();
      case 1000:
        return new ScSpecTypeDefOption(
          ScSpecTypeOption.fromXdrObject(wire.option),
        );
      case 1001:
        return new ScSpecTypeDefResult(
          ScSpecTypeResult.fromXdrObject(wire.result),
        );
      case 1002:
        return new ScSpecTypeDefVec(ScSpecTypeVec.fromXdrObject(wire.vec));
      case 1004:
        return new ScSpecTypeDefMap(ScSpecTypeMap.fromXdrObject(wire.map));
      case 1005:
        return new ScSpecTypeDefTuple(
          ScSpecTypeTuple.fromXdrObject(wire.tuple),
        );
      case 1006:
        return new ScSpecTypeDefBytesN(
          ScSpecTypeBytesN.fromXdrObject(wire.bytesN),
        );
      case 2000:
        return new ScSpecTypeDefUdt(ScSpecTypeUdt.fromXdrObject(wire.udt));
    }
  }

  abstract toXdrObject(): ScSpecTypeDefWire;
}

export class ScSpecTypeDefVal extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeVal" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class ScSpecTypeDefBool extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeBool" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1 }> {
    return { type: 1 };
  }
}

export class ScSpecTypeDefVoid extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeVoid" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 2 }> {
    return { type: 2 };
  }
}

export class ScSpecTypeDefError extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeError" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 3 }> {
    return { type: 3 };
  }
}

export class ScSpecTypeDefU32 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeU32" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 4 }> {
    return { type: 4 };
  }
}

export class ScSpecTypeDefI32 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeI32" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 5 }> {
    return { type: 5 };
  }
}

export class ScSpecTypeDefU64 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeU64" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 6 }> {
    return { type: 6 };
  }
}

export class ScSpecTypeDefI64 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeI64" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 7 }> {
    return { type: 7 };
  }
}

export class ScSpecTypeDefTimepoint extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeTimepoint" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 8 }> {
    return { type: 8 };
  }
}

export class ScSpecTypeDefDuration extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeDuration" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 9 }> {
    return { type: 9 };
  }
}

export class ScSpecTypeDefU128 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeU128" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 10 }> {
    return { type: 10 };
  }
}

export class ScSpecTypeDefI128 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeI128" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 11 }> {
    return { type: 11 };
  }
}

export class ScSpecTypeDefU256 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeU256" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 12 }> {
    return { type: 12 };
  }
}

export class ScSpecTypeDefI256 extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeI256" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 13 }> {
    return { type: 13 };
  }
}

export class ScSpecTypeDefBytes extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeBytes" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 14 }> {
    return { type: 14 };
  }
}

export class ScSpecTypeDefString extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeString" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 16 }> {
    return { type: 16 };
  }
}

export class ScSpecTypeDefSymbol extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeSymbol" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 17 }> {
    return { type: 17 };
  }
}

export class ScSpecTypeDefAddress extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeAddress" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 19 }> {
    return { type: 19 };
  }
}

export class ScSpecTypeDefMuxedAddress extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeMuxedAddress" as const;

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 20 }> {
    return { type: 20 };
  }
}

export class ScSpecTypeDefOption extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeOption" as const;
  readonly option: ScSpecTypeOption;

  constructor(option: ScSpecTypeOption) {
    super();
    this.option = option;
  }

  get value(): ScSpecTypeOption {
    return this.option;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1000 }> {
    return { type: 1000, option: this.option.toXdrObject() };
  }
}

export class ScSpecTypeDefResult extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeResult" as const;
  readonly result: ScSpecTypeResult;

  constructor(result: ScSpecTypeResult) {
    super();
    this.result = result;
  }

  get value(): ScSpecTypeResult {
    return this.result;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1001 }> {
    return { type: 1001, result: this.result.toXdrObject() };
  }
}

export class ScSpecTypeDefVec extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeVec" as const;
  readonly vec: ScSpecTypeVec;

  constructor(vec: ScSpecTypeVec) {
    super();
    this.vec = vec;
  }

  get value(): ScSpecTypeVec {
    return this.vec;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1002 }> {
    return { type: 1002, vec: this.vec.toXdrObject() };
  }
}

export class ScSpecTypeDefMap extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeMap" as const;
  readonly map: ScSpecTypeMap;

  constructor(map: ScSpecTypeMap) {
    super();
    this.map = map;
  }

  get value(): ScSpecTypeMap {
    return this.map;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1004 }> {
    return { type: 1004, map: this.map.toXdrObject() };
  }
}

export class ScSpecTypeDefTuple extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeTuple" as const;
  readonly tuple: ScSpecTypeTuple;

  constructor(tuple: ScSpecTypeTuple) {
    super();
    this.tuple = tuple;
  }

  get value(): ScSpecTypeTuple {
    return this.tuple;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1005 }> {
    return { type: 1005, tuple: this.tuple.toXdrObject() };
  }
}

export class ScSpecTypeDefBytesN extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeBytesN" as const;
  readonly bytesN: ScSpecTypeBytesN;

  constructor(bytesN: ScSpecTypeBytesN) {
    super();
    this.bytesN = bytesN;
  }

  get value(): ScSpecTypeBytesN {
    return this.bytesN;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 1006 }> {
    return { type: 1006, bytesN: this.bytesN.toXdrObject() };
  }
}

export class ScSpecTypeDefUdt extends ScSpecTypeDefBase {
  readonly type = "scSpecTypeUdt" as const;
  readonly udt: ScSpecTypeUdt;

  constructor(udt: ScSpecTypeUdt) {
    super();
    this.udt = udt;
  }

  get value(): ScSpecTypeUdt {
    return this.udt;
  }

  toXdrObject(): Extract<ScSpecTypeDefWire, { type: 2000 }> {
    return { type: 2000, udt: this.udt.toXdrObject() };
  }
}

export type ScSpecTypeDef =
  | ScSpecTypeDefVal
  | ScSpecTypeDefBool
  | ScSpecTypeDefVoid
  | ScSpecTypeDefError
  | ScSpecTypeDefU32
  | ScSpecTypeDefI32
  | ScSpecTypeDefU64
  | ScSpecTypeDefI64
  | ScSpecTypeDefTimepoint
  | ScSpecTypeDefDuration
  | ScSpecTypeDefU128
  | ScSpecTypeDefI128
  | ScSpecTypeDefU256
  | ScSpecTypeDefI256
  | ScSpecTypeDefBytes
  | ScSpecTypeDefString
  | ScSpecTypeDefSymbol
  | ScSpecTypeDefAddress
  | ScSpecTypeDefMuxedAddress
  | ScSpecTypeDefOption
  | ScSpecTypeDefResult
  | ScSpecTypeDefVec
  | ScSpecTypeDefMap
  | ScSpecTypeDefTuple
  | ScSpecTypeDefBytesN
  | ScSpecTypeDefUdt;
export const ScSpecTypeDef = ScSpecTypeDefBase;

export interface ScSpecTypeMapWire {
  keyType: ScSpecTypeDefWire;
  valueType: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecTypeMap
 * {
 *     SCSpecTypeDef keyType;
 *     SCSpecTypeDef valueType;
 * };
 * ```
 */
export class ScSpecTypeMap extends XdrValue {
  readonly keyType: ScSpecTypeDef;
  readonly valueType: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecTypeMapWire> = struct("ScSpecTypeMap", {
    keyType: lazy(() => ScSpecTypeDef.schema),
    valueType: lazy(() => ScSpecTypeDef.schema),
  });

  constructor(input: { keyType: ScSpecTypeDef; valueType: ScSpecTypeDef }) {
    super();
    this.keyType = input.keyType;
    this.valueType = input.valueType;
  }

  toXdrObject(): ScSpecTypeMapWire {
    return {
      keyType: this.keyType.toXdrObject(),
      valueType: this.valueType.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecTypeMapWire): ScSpecTypeMap {
    return new ScSpecTypeMap({
      keyType: ScSpecTypeDef.fromXdrObject(wire.keyType),
      valueType: ScSpecTypeDef.fromXdrObject(wire.valueType),
    });
  }
}

export interface ScSpecTypeOptionWire {
  valueType: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecTypeOption
 * {
 *     SCSpecTypeDef valueType;
 * };
 * ```
 */
export class ScSpecTypeOption extends XdrValue {
  readonly valueType: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecTypeOptionWire> = struct(
    "ScSpecTypeOption",
    {
      valueType: lazy(() => ScSpecTypeDef.schema),
    },
  );

  constructor(input: { valueType: ScSpecTypeDef }) {
    super();
    this.valueType = input.valueType;
  }

  toXdrObject(): ScSpecTypeOptionWire {
    return {
      valueType: this.valueType.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecTypeOptionWire): ScSpecTypeOption {
    return new ScSpecTypeOption({
      valueType: ScSpecTypeDef.fromXdrObject(wire.valueType),
    });
  }
}

export interface ScSpecTypeResultWire {
  okType: ScSpecTypeDefWire;
  errorType: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecTypeResult
 * {
 *     SCSpecTypeDef okType;
 *     SCSpecTypeDef errorType;
 * };
 * ```
 */
export class ScSpecTypeResult extends XdrValue {
  readonly okType: ScSpecTypeDef;
  readonly errorType: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecTypeResultWire> = struct(
    "ScSpecTypeResult",
    {
      okType: lazy(() => ScSpecTypeDef.schema),
      errorType: lazy(() => ScSpecTypeDef.schema),
    },
  );

  constructor(input: { okType: ScSpecTypeDef; errorType: ScSpecTypeDef }) {
    super();
    this.okType = input.okType;
    this.errorType = input.errorType;
  }

  toXdrObject(): ScSpecTypeResultWire {
    return {
      okType: this.okType.toXdrObject(),
      errorType: this.errorType.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecTypeResultWire): ScSpecTypeResult {
    return new ScSpecTypeResult({
      okType: ScSpecTypeDef.fromXdrObject(wire.okType),
      errorType: ScSpecTypeDef.fromXdrObject(wire.errorType),
    });
  }
}

export interface ScSpecTypeTupleWire {
  valueTypes: ScSpecTypeDefWire[];
}

/**
 * ```xdr
 * struct SCSpecTypeTuple
 * {
 *     SCSpecTypeDef valueTypes<12>;
 * };
 * ```
 */
export class ScSpecTypeTuple extends XdrValue {
  readonly valueTypes: ScSpecTypeDef[];

  static readonly schema: XdrType<ScSpecTypeTupleWire> = struct(
    "ScSpecTypeTuple",
    {
      valueTypes: array(
        lazy(() => ScSpecTypeDef.schema),
        UNBOUNDED_MAX_LENGTH,
      ),
    },
  );

  constructor(input: { valueTypes: ScSpecTypeDef[] }) {
    super();
    this.valueTypes = input.valueTypes;
  }

  toXdrObject(): ScSpecTypeTupleWire {
    return {
      valueTypes: this.valueTypes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecTypeTupleWire): ScSpecTypeTuple {
    return new ScSpecTypeTuple({
      valueTypes: wire.valueTypes.map((w) => ScSpecTypeDef.fromXdrObject(w)),
    });
  }
}

export interface ScSpecTypeVecWire {
  elementType: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecTypeVec
 * {
 *     SCSpecTypeDef elementType;
 * };
 * ```
 */
export class ScSpecTypeVec extends XdrValue {
  readonly elementType: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecTypeVecWire> = struct("ScSpecTypeVec", {
    elementType: lazy(() => ScSpecTypeDef.schema),
  });

  constructor(input: { elementType: ScSpecTypeDef }) {
    super();
    this.elementType = input.elementType;
  }

  toXdrObject(): ScSpecTypeVecWire {
    return {
      elementType: this.elementType.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecTypeVecWire): ScSpecTypeVec {
    return new ScSpecTypeVec({
      elementType: ScSpecTypeDef.fromXdrObject(wire.elementType),
    });
  }
}
