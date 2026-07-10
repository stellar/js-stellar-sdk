import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ScErrorTypeWire = number;

export type ScErrorTypeName =
  | "sceContract"
  | "sceWasmVm"
  | "sceContext"
  | "sceStorage"
  | "sceObject"
  | "sceCrypto"
  | "sceEvents"
  | "sceBudget"
  | "sceValue"
  | "sceAuth";

/**
 * ```xdr
 * enum SCErrorType
 * {
 *     SCE_CONTRACT = 0,          // Contract-specific, user-defined codes.
 *     SCE_WASM_VM = 1,           // Errors while interpreting WASM bytecode.
 *     SCE_CONTEXT = 2,           // Errors in the contract's host context.
 *     SCE_STORAGE = 3,           // Errors accessing host storage.
 *     SCE_OBJECT = 4,            // Errors working with host objects.
 *     SCE_CRYPTO = 5,            // Errors in cryptographic operations.
 *     SCE_EVENTS = 6,            // Errors while emitting events.
 *     SCE_BUDGET = 7,            // Errors relating to budget limits.
 *     SCE_VALUE = 8,             // Errors working with host values or SCVals.
 *     SCE_AUTH = 9               // Errors from the authentication subsystem.
 * };
 * ```
 */
export class ScErrorType extends EnumValue<ScErrorTypeName> {
  static readonly sceContract = new ScErrorType("sceContract", 0);
  static readonly sceWasmVm = new ScErrorType("sceWasmVm", 1);
  static readonly sceContext = new ScErrorType("sceContext", 2);
  static readonly sceStorage = new ScErrorType("sceStorage", 3);
  static readonly sceObject = new ScErrorType("sceObject", 4);
  static readonly sceCrypto = new ScErrorType("sceCrypto", 5);
  static readonly sceEvents = new ScErrorType("sceEvents", 6);
  static readonly sceBudget = new ScErrorType("sceBudget", 7);
  static readonly sceValue = new ScErrorType("sceValue", 8);
  static readonly sceAuth = new ScErrorType("sceAuth", 9);

  static readonly schema = withMemberPrefix(
    enumType("ScErrorType", {
      sceContract: 0,
      sceWasmVm: 1,
      sceContext: 2,
      sceStorage: 3,
      sceObject: 4,
      sceCrypto: 5,
      sceEvents: 6,
      sceBudget: 7,
      sceValue: 8,
      sceAuth: 9,
    }),
    "sce",
  );

  static fromValue(value: number): ScErrorType {
    return enumFromValue("ScErrorType", ScErrorType.schema, ScErrorType, value);
  }

  static fromName(name: ScErrorTypeName): ScErrorType {
    return enumFromName("ScErrorType", ScErrorType, name);
  }

  static fromXdrObject(wire: number): ScErrorType {
    return ScErrorType.fromValue(wire);
  }
}
