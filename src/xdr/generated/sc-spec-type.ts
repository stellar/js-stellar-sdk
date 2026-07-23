import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ScSpecTypeWire = number;

export type ScSpecTypeName =
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
 * enum SCSpecType
 * {
 *     SC_SPEC_TYPE_VAL = 0,
 *
 *     // Types with no parameters.
 *     SC_SPEC_TYPE_BOOL = 1,
 *     SC_SPEC_TYPE_VOID = 2,
 *     SC_SPEC_TYPE_ERROR = 3,
 *     SC_SPEC_TYPE_U32 = 4,
 *     SC_SPEC_TYPE_I32 = 5,
 *     SC_SPEC_TYPE_U64 = 6,
 *     SC_SPEC_TYPE_I64 = 7,
 *     SC_SPEC_TYPE_TIMEPOINT = 8,
 *     SC_SPEC_TYPE_DURATION = 9,
 *     SC_SPEC_TYPE_U128 = 10,
 *     SC_SPEC_TYPE_I128 = 11,
 *     SC_SPEC_TYPE_U256 = 12,
 *     SC_SPEC_TYPE_I256 = 13,
 *     SC_SPEC_TYPE_BYTES = 14,
 *     SC_SPEC_TYPE_STRING = 16,
 *     SC_SPEC_TYPE_SYMBOL = 17,
 *     SC_SPEC_TYPE_ADDRESS = 19,
 *     SC_SPEC_TYPE_MUXED_ADDRESS = 20,
 *
 *     // Types with parameters.
 *     SC_SPEC_TYPE_OPTION = 1000,
 *     SC_SPEC_TYPE_RESULT = 1001,
 *     SC_SPEC_TYPE_VEC = 1002,
 *     SC_SPEC_TYPE_MAP = 1004,
 *     SC_SPEC_TYPE_TUPLE = 1005,
 *     SC_SPEC_TYPE_BYTES_N = 1006,
 *
 *     // User defined types.
 *     SC_SPEC_TYPE_UDT = 2000
 * };
 * ```
 */
export class ScSpecType extends EnumValue<ScSpecTypeName> {
  static readonly scSpecTypeVal = new ScSpecType("scSpecTypeVal", 0);
  static readonly scSpecTypeBool = new ScSpecType("scSpecTypeBool", 1);
  static readonly scSpecTypeVoid = new ScSpecType("scSpecTypeVoid", 2);
  static readonly scSpecTypeError = new ScSpecType("scSpecTypeError", 3);
  static readonly scSpecTypeU32 = new ScSpecType("scSpecTypeU32", 4);
  static readonly scSpecTypeI32 = new ScSpecType("scSpecTypeI32", 5);
  static readonly scSpecTypeU64 = new ScSpecType("scSpecTypeU64", 6);
  static readonly scSpecTypeI64 = new ScSpecType("scSpecTypeI64", 7);
  static readonly scSpecTypeTimepoint = new ScSpecType(
    "scSpecTypeTimepoint",
    8,
  );
  static readonly scSpecTypeDuration = new ScSpecType("scSpecTypeDuration", 9);
  static readonly scSpecTypeU128 = new ScSpecType("scSpecTypeU128", 10);
  static readonly scSpecTypeI128 = new ScSpecType("scSpecTypeI128", 11);
  static readonly scSpecTypeU256 = new ScSpecType("scSpecTypeU256", 12);
  static readonly scSpecTypeI256 = new ScSpecType("scSpecTypeI256", 13);
  static readonly scSpecTypeBytes = new ScSpecType("scSpecTypeBytes", 14);
  static readonly scSpecTypeString = new ScSpecType("scSpecTypeString", 16);
  static readonly scSpecTypeSymbol = new ScSpecType("scSpecTypeSymbol", 17);
  static readonly scSpecTypeAddress = new ScSpecType("scSpecTypeAddress", 19);
  static readonly scSpecTypeMuxedAddress = new ScSpecType(
    "scSpecTypeMuxedAddress",
    20,
  );
  static readonly scSpecTypeOption = new ScSpecType("scSpecTypeOption", 1000);
  static readonly scSpecTypeResult = new ScSpecType("scSpecTypeResult", 1001);
  static readonly scSpecTypeVec = new ScSpecType("scSpecTypeVec", 1002);
  static readonly scSpecTypeMap = new ScSpecType("scSpecTypeMap", 1004);
  static readonly scSpecTypeTuple = new ScSpecType("scSpecTypeTuple", 1005);
  static readonly scSpecTypeBytesN = new ScSpecType("scSpecTypeBytesN", 1006);
  static readonly scSpecTypeUdt = new ScSpecType("scSpecTypeUdt", 2000);

  static readonly schema = withMemberPrefix(
    enumType("ScSpecType", {
      scSpecTypeVal: 0,
      scSpecTypeBool: 1,
      scSpecTypeVoid: 2,
      scSpecTypeError: 3,
      scSpecTypeU32: 4,
      scSpecTypeI32: 5,
      scSpecTypeU64: 6,
      scSpecTypeI64: 7,
      scSpecTypeTimepoint: 8,
      scSpecTypeDuration: 9,
      scSpecTypeU128: 10,
      scSpecTypeI128: 11,
      scSpecTypeU256: 12,
      scSpecTypeI256: 13,
      scSpecTypeBytes: 14,
      scSpecTypeString: 16,
      scSpecTypeSymbol: 17,
      scSpecTypeAddress: 19,
      scSpecTypeMuxedAddress: 20,
      scSpecTypeOption: 1000,
      scSpecTypeResult: 1001,
      scSpecTypeVec: 1002,
      scSpecTypeMap: 1004,
      scSpecTypeTuple: 1005,
      scSpecTypeBytesN: 1006,
      scSpecTypeUdt: 2000,
    }),
    "scSpecType",
  );

  static fromValue(value: number): ScSpecType {
    return enumFromValue("ScSpecType", ScSpecType.schema, ScSpecType, value);
  }

  static fromName(name: ScSpecTypeName): ScSpecType {
    return enumFromName("ScSpecType", ScSpecType, name);
  }

  static fromXdrObject(wire: number): ScSpecType {
    return ScSpecType.fromValue(wire);
  }
}
