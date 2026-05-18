import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, ScErrorType>> = {
    0: ScErrorType.sceContract,
    1: ScErrorType.sceWasmVm,
    2: ScErrorType.sceContext,
    3: ScErrorType.sceStorage,
    4: ScErrorType.sceObject,
    5: ScErrorType.sceCrypto,
    6: ScErrorType.sceEvents,
    7: ScErrorType.sceBudget,
    8: ScErrorType.sceValue,
    9: ScErrorType.sceAuth,
  };

  static readonly schema = enumType("ScErrorType", {
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
  });

  static fromValue(value: number): ScErrorType {
    return enumLookup("ScErrorType", ScErrorType.byValue, value) as ScErrorType;
  }

  static fromName(name: ScErrorTypeName): ScErrorType {
    switch (name) {
      case "sceContract":
        return ScErrorType.sceContract;
      case "sceWasmVm":
        return ScErrorType.sceWasmVm;
      case "sceContext":
        return ScErrorType.sceContext;
      case "sceStorage":
        return ScErrorType.sceStorage;
      case "sceObject":
        return ScErrorType.sceObject;
      case "sceCrypto":
        return ScErrorType.sceCrypto;
      case "sceEvents":
        return ScErrorType.sceEvents;
      case "sceBudget":
        return ScErrorType.sceBudget;
      case "sceValue":
        return ScErrorType.sceValue;
      case "sceAuth":
        return ScErrorType.sceAuth;
      default:
        throw new XdrError(`ScErrorType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScErrorType {
    return ScErrorType.fromValue(wire);
  }
}
