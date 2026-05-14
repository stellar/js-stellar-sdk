import {
  Int32,
  ScError,
  ScMapEntry,
  ScSpecEntry,
  ScSpecEntryKind,
  ScSpecFunctionInputV0,
  ScSpecFunctionV0,
  ScSpecType,
  ScSpecTypeDef,
  Uint64,
  Int64,
  Uint128Parts,
  Int128Parts,
  Uint256Parts,
  Int256Parts,
  ScSpecTypeUdt,
  ScSpecUdtEnumV0,
  TimePoint,
  ScSpecUdtErrorEnumCaseV0,
  ScSpecUdtStructFieldV0,
  ScSpecUdtStructV0,
  ScSpecUdtUnionCaseV0,
  ScSpecUdtUnionCaseV0Kind,
  ScSpecUdtUnionV0,
  ScVal,
  ScValType,
  Uint32,
  Duration,
  ScErrorType,
} from "../base/generated/index.js";
import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { Address, Contract } from "../base/index.js";
import { Ok, Err } from "./rust_result.js";
import { processSpecEntryStream, validateScSpecType } from "./utils.js";
import { specFromWasm } from "./wasm_spec_parser.js";
import { SCVal } from "../base/generated/schema/stellar-contract-cycle.js";

export interface Union<T> {
  tag: string;
  values?: T;
}

function enumToJsonSchema(udt: ScSpecUdtEnumV0): any {
  const description = udt.doc;
  const cases = udt.cases;
  const oneOf: any[] = [];
  cases.forEach((aCase) => {
    const title = aCase.name;
    const desc = aCase.doc;
    oneOf.push({
      description: desc,
      title,
      enum: [aCase],
      type: "number",
    });
  });
  const res: any = { oneOf };
  if (description.length > 0) {
    res.description = description;
  }
  return res;
}

function isNumeric(field: ScSpecUdtStructFieldV0) {
  return /^\d+$/.test(field.name);
}

function readObj(args: object, input: ScSpecFunctionInputV0): any {
  const inputName = input.name;
  const entry = Object.entries(args).find(([name]) => name === inputName);
  if (!entry) {
    throw new Error(`Missing field ${inputName}`);
  }
  return entry[1];
}

function findCase(name: string) {
  return function matches(entry: ScSpecUdtUnionCaseV0) {
    switch (entry.type) {
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0: {
        const tuple = entry.tupleCase;
        return tuple.name === name;
      }
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0: {
        const voidCase = entry.voidCase;
        return voidCase.name === name;
      }
      default:
        return false;
    }
  };
}

function stringToScVal(str: string, ty: ScSpecType): ScVal {
  switch (ty) {
    case ScSpecType.scSpecTypeString:
      return ScVal.scvString(str);
    case ScSpecType.scSpecTypeSymbol:
      return ScVal.scvSymbol(str);
    case ScSpecType.scSpecTypeAddress:
    case ScSpecType.scSpecTypeMuxedAddress:
      return Address.fromString(str).toScVal();
    case ScSpecType.scSpecTypeU64:
      return ScVal.scvU64(BigInt(str));
    case ScSpecType.scSpecTypeI64:
      return ScVal.scvI64(BigInt(str));
    case ScSpecType.scSpecTypeU128:
      return ScVal.scvU128(BigInt(str));
    case ScSpecType.scSpecTypeI128:
      return ScVal.scvI128(BigInt(str));
    case ScSpecType.scSpecTypeU256:
      return ScVal.scvU256(BigInt(str));
    case ScSpecType.scSpecTypeI256:
      return ScVal.scvI256(BigInt(str));
    case ScSpecType.scSpecTypeBytes:
    case ScSpecType.scSpecTypeBytesN:
      return ScVal.scvBytes(Buffer.from(str, "base64"));
    case ScSpecType.scSpecTypeTimepoint: {
      return ScVal.scvTimepoint(BigInt(str));
    }
    case ScSpecType.scSpecTypeDuration: {
      return ScVal.scvDuration(BigInt(str));
    }
    default:
      throw new TypeError(`invalid type ${ty} specified for string value`);
  }
}

const PRIMITIVE_DEFINITONS: { [key: string]: JSONSchema7Definition } = {
  U32: {
    type: "integer",
    minimum: 0,
    maximum: 4294967295,
  },
  I32: {
    type: "integer",
    minimum: -2147483648,
    maximum: 2147483647,
  },
  U64: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 20, // 64-bit max value has 20 digits
  },
  Timepoint: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 20, // 64-bit max value has 20 digits
  },
  Duration: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 20, // 64-bit max value has 20 digits
  },
  I64: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 21, // Includes additional digit for the potential '-'
  },
  U128: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 39, // 128-bit max value has 39 digits
  },
  I128: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 40, // Includes additional digit for the potential '-'
  },
  U256: {
    type: "string",
    pattern: "^([1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 78, // 256-bit max value has 78 digits
  },
  I256: {
    type: "string",
    pattern: "^(-?[1-9][0-9]*|0)$",
    minLength: 1,
    maxLength: 79, // Includes additional digit for the potential '-'
  },
  Address: {
    type: "string",
    format: "address",
    description: "Address can be a public key or contract id",
  },
  MuxedAddress: {
    type: "string",
    format: "address",
    description:
      "Stellar public key with M prefix combining a G address and unique ID",
  },
  ScString: {
    type: "string",
    description: "ScString is a string",
  },
  ScSymbol: {
    type: "string",
    description: "ScSymbol is a string",
  },
  DataUrl: {
    type: "string",
    pattern:
      "^(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?$",
  },
};

/**
 * Converts an XDR type definition to a JSON schema reference.
 * @param typeDef type to convert to json schema reference
 * @returns {JSONSchema7} a schema describing the type
 * @private
 */
function typeRef(typeDef: ScSpecTypeDef): JSONSchema7 {
  let ref;
  switch (typeDef.type) {
    case ScSpecType.scSpecTypeVal: {
      ref = "Val";
      break;
    }
    case ScSpecType.scSpecTypeBool: {
      return { type: "boolean" };
    }
    case ScSpecType.scSpecTypeVoid: {
      return { type: "null" };
    }
    case ScSpecType.scSpecTypeError: {
      ref = "Error";
      break;
    }
    case ScSpecType.scSpecTypeU32: {
      ref = "U32";
      break;
    }
    case ScSpecType.scSpecTypeI32: {
      ref = "I32";
      break;
    }
    case ScSpecType.scSpecTypeU64: {
      ref = "U64";
      break;
    }
    case ScSpecType.scSpecTypeI64: {
      ref = "I64";
      break;
    }
    case ScSpecType.scSpecTypeTimepoint: {
      ref = "Timepoint";
      break;
    }
    case ScSpecType.scSpecTypeDuration: {
      ref = "Duration";
      break;
    }
    case ScSpecType.scSpecTypeU128: {
      ref = "U128";
      break;
    }
    case ScSpecType.scSpecTypeI128: {
      ref = "I128";
      break;
    }
    case ScSpecType.scSpecTypeU256: {
      ref = "U256";
      break;
    }
    case ScSpecType.scSpecTypeI256: {
      ref = "I256";
      break;
    }
    case ScSpecType.scSpecTypeBytes: {
      ref = "DataUrl";
      break;
    }
    case ScSpecType.scSpecTypeString: {
      ref = "ScString";
      break;
    }
    case ScSpecType.scSpecTypeSymbol: {
      ref = "ScSymbol";
      break;
    }
    case ScSpecType.scSpecTypeAddress: {
      ref = "Address";
      break;
    }
    case ScSpecType.scSpecTypeMuxedAddress: {
      ref = "MuxedAddress";
      break;
    }
    case ScSpecType.scSpecTypeOption: {
      return typeRef(typeDef.option.valueType);
    }
    case ScSpecType.scSpecTypeResult: {
      const result = typeDef.result;
      return typeRef(result.okType);
    }
    case ScSpecType.scSpecTypeVec: {
      const arr = typeDef.vec;
      const reference = typeRef(arr.elementType);
      return {
        type: "array",
        items: reference,
      };
    }
    case ScSpecType.scSpecTypeMap: {
      const map = typeDef.map;
      const items = [typeRef(map.keyType), typeRef(map.valueType)];
      return {
        type: "array",
        items: {
          type: "array",
          items,
          minItems: 2,
          maxItems: 2,
        },
      };
    }
    case ScSpecType.scSpecTypeTuple: {
      const tuple = typeDef.tuple;
      const minItems = tuple.valueTypes.length;
      const maxItems = minItems;
      const items = tuple.valueTypes.map(typeRef);
      return { type: "array", items, minItems, maxItems };
    }
    case ScSpecType.scSpecTypeBytesN: {
      const arr = typeDef.bytesN;
      return {
        $ref: "#/definitions/DataUrl",
        maxLength: arr.n,
      };
    }
    case ScSpecType.scSpecTypeUdt: {
      const udt = typeDef.udt;
      ref = udt.name;
      break;
    }
  }
  return { $ref: `#/definitions/${ref}` };
}

type Func = { input: JSONSchema7; output: JSONSchema7 };

function isRequired(typeDef: ScSpecTypeDef): boolean {
  return typeDef.type !== ScSpecType.scSpecTypeOption;
}

function argsAndRequired(
  input: readonly { type: ScSpecTypeDef; name: string }[],
): { properties: object; required?: string[] } {
  const properties: any = {};
  const required: string[] = [];
  input.forEach((arg) => {
    const aType = arg.type;
    const name = arg.name;
    properties[name] = typeRef(aType);
    if (isRequired(aType)) {
      required.push(name);
    }
  });
  const res: { properties: object; required?: string[] } = { properties };
  if (required.length > 0) {
    res.required = required;
  }
  return res;
}

function structToJsonSchema(udt: ScSpecUdtStructV0): object {
  const fields = udt.fields;
  if (fields.some(isNumeric)) {
    if (!fields.every(isNumeric)) {
      throw new Error(
        "mixed numeric and non-numeric field names are not allowed",
      );
    }
    const items = fields.map((_, i) => typeRef(fields[i].type));
    return {
      type: "array",
      items,
      minItems: fields.length,
      maxItems: fields.length,
    };
  }
  const description = udt.doc;

  const { properties, required }: any = argsAndRequired(fields);
  return {
    description,
    properties,
    required,
    additionalProperties: false,
    type: "object",
  };
}

function functionToJsonSchema(func: ScSpecFunctionV0): Func {
  const { properties, required }: any = argsAndRequired(func.inputs);
  const args: any = {
    additionalProperties: false,
    properties,
    type: "object",
  };
  if (required?.length > 0) {
    args.required = required;
  }
  const input: Partial<JSONSchema7> = {
    properties: {
      args,
    },
  };
  const outputs = func.outputs;
  const output: Partial<JSONSchema7> =
    outputs.length > 0
      ? typeRef(outputs[0])
      : typeRef(ScSpecTypeDef.scSpecTypeVoid());
  const description = func.doc;
  if (description.length > 0) {
    input.description = description;
  }
  input.additionalProperties = false;
  output.additionalProperties = false;
  return {
    input,
    output,
  };
}

function unionToJsonSchema(udt: ScSpecUdtUnionV0): any {
  const description = udt.doc;
  const cases = udt.cases;
  const oneOf: any[] = [];
  cases.forEach((aCase) => {
    switch (aCase.type) {
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0: {
        const c = aCase.voidCase;
        const title = c.name;
        oneOf.push({
          type: "object",
          title,
          properties: {
            tag: title,
          },
          additionalProperties: false,
          required: ["tag"],
        });
        break;
      }
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0: {
        const c = aCase.tupleCase;
        const title = c.name;
        oneOf.push({
          type: "object",
          title,
          properties: {
            tag: title,
            values: {
              type: "array",
              items: c.type.map(typeRef),
            },
          },
          required: ["tag", "values"],
          additionalProperties: false,
        });
      }
    }
  });

  const res: any = {
    oneOf,
  };
  if (description.length > 0) {
    res.description = description;
  }
  return res;
}

/**
 * Provides a ContractSpec class which can contains the XDR types defined by the contract.
 * This allows the class to be used to convert between native and raw `ScVal`s.
 *
 * Constructs a new ContractSpec from an array of XDR spec entries.
 *
 * @memberof module:contract
 * @param {ScSpecEntry[] | string[]} entries the XDR spec entries
 * @throws {Error} if entries is invalid
 *
 * @example
 * const specEntries = [...]; // XDR spec entries of a smart contract
 * const contractSpec = new ContractSpec(specEntries);
 *
 * // Convert native value to ScVal
 * const args = {
 *   arg1: 'value1',
 *   arg2: 1234
 * };
 * const scArgs = contractSpec.funcArgsToScVals('funcName', args);
 *
 * // Call contract
 * const resultScv = await callContract(contractId, 'funcName', scArgs);
 *
 * // Convert result ScVal back to native value
 * const result = contractSpec.funcResToNative('funcName', resultScv);
 *
 * console.log(result); // {success: true}
 */
export class Spec {
  /**
   * The XDR spec entries.
   */
  public entries: ScSpecEntry[] = [];

  /**
   * Generates a Spec instance from the contract's wasm binary.
   *
   * @param {Buffer} wasm The contract's wasm binary as a Buffer.
   * @returns {Promise<module:contract.Spec>} A Promise that resolves to a Spec instance.
   * @throws {Error} If the contract spec cannot be obtained from the provided wasm binary.
   */
  static fromWasm(wasm: Buffer): Spec {
    const spec = specFromWasm(wasm);
    return new Spec(spec);
  }

  /**
   * Generates a Spec instance from contract specs in any of the following forms:
   * - An XDR encoded stream of ScSpecEntry entries, the format of the spec
   *   stored inside Wasm files.
   * - A base64 XDR encoded stream of ScSpecEntry entries.
   * - An array of ScSpecEntry.
   * - An array of base64 XDR encoded ScSpecEntry.
   *
   * @returns {Promise<module:contract.Client>} A Promise that resolves to a Client instance.
   * @throws {Error} If the contract spec cannot be obtained from the provided wasm binary.
   */
  constructor(entries: Buffer | string | ScSpecEntry[] | string[]) {
    if (Buffer.isBuffer(entries)) {
      this.entries = processSpecEntryStream(entries as Buffer);
    } else if (typeof entries === "string") {
      this.entries = processSpecEntryStream(Buffer.from(entries, "base64"));
    } else {
      if (entries.length === 0) {
        throw new Error("Contract spec must have at least one entry");
      }
      const entry = entries[0];
      if (typeof entry === "string") {
        this.entries = (entries as string[]).map((s) =>
          ScSpecEntry.fromXDR(s, "base64"),
        );
      } else {
        this.entries = entries as ScSpecEntry[];
      }
    }
  }

  /**
   * Gets the XDR functions from the spec.
   * @returns {ScSpecFunctionV0[]} all contract functions
   */
  funcs(): ScSpecFunctionV0[] {
    return this.entries
      .filter((entry) => entry.type === ScSpecEntryKind.scSpecEntryFunctionV0)
      .map((entry) => entry.functionV0);
  }

  /**
   * Gets the XDR function spec for the given function name.
   *
   * @param {string} name the name of the function
   * @returns {ScSpecFunctionV0} the function spec
   *
   * @throws {Error} if no function with the given name exists
   */
  getFunc(name: string): ScSpecFunctionV0 {
    const entry = this.findEntry(name);
    if (entry.type !== ScSpecEntryKind.scSpecEntryFunctionV0) {
      throw new Error(`${name} is not a function`);
    }
    return entry.functionV0;
  }

  /**
   * Converts native JS arguments to ScVals for calling a contract function.
   *
   * @param {string} name the name of the function
   * @param {object} args the arguments object
   * @returns {ScVal[]} the converted arguments
   *
   * @throws {Error} if argument is missing or incorrect type
   *
   * @example
   * const args = {
   *   arg1: 'value1',
   *   arg2: 1234
   * };
   * const scArgs = contractSpec.funcArgsToScVals('funcName', args);
   */
  funcArgsToScVals(name: string, args: object): ScVal[] {
    const fn = this.getFunc(name);
    return fn.inputs.map((input) =>
      this.nativeToScVal(readObj(args, input), input.type),
    );
  }

  /**
   * Converts the result ScVal of a function call to a native JS value.
   *
   * @param {string} name the name of the function
   * @param {ScVal | string} val_or_base64 the result ScVal or base64 encoded string
   * @returns {any} the converted native value
   *
   * @throws {Error} if return type mismatch or invalid input
   *
   * @example
   * const resultScv = 'AAA=='; // Base64 encoded ScVal
   * const result = contractSpec.funcResToNative('funcName', resultScv);
   */
  funcResToNative(name: string, val_or_base64: ScVal | string): any {
    const val =
      typeof val_or_base64 === "string"
        ? ScVal.fromXDR(val_or_base64, "base64")
        : val_or_base64;
    const func = this.getFunc(name);
    const outputs = func.outputs;
    if (outputs.length === 0) {
      const type = val.type;
      if (type !== ScValType.scvVoid) {
        throw new Error(`Expected void, got ${type}`);
      }
      return null;
    }
    if (outputs.length > 1) {
      throw new Error(`Multiple outputs not supported`);
    }
    const output = outputs[0];
    if (output.type === ScSpecType.scSpecTypeResult) {
      if (val.type === ScValType.scvError) {
        return new Err({ message: ScError.toXDR(val.error, "base64") });
      }
      return new Ok(this.scValToNative(val, output.result.okType));
    }
    return this.scValToNative(val, output);
  }

  /**
   * Finds the XDR spec entry for the given name.
   *
   * @param {string} name the name to find
   * @returns {ScSpecEntry} the entry
   *
   * @throws {Error} if no entry with the given name exists
   */
  findEntry(name: string): ScSpecEntry {
    const entry = this.entries.find(
      (e) =>
        (e.type === ScSpecEntryKind.scSpecEntryFunctionV0 &&
          e.functionV0.name === name) ||
        (e.type === ScSpecEntryKind.scSpecEntryUdtStructV0 &&
          e.udtStructV0.name === name) ||
        (e.type === ScSpecEntryKind.scSpecEntryUdtEnumV0 &&
          e.udtEnumV0.name === name) ||
        (e.type === ScSpecEntryKind.scSpecEntryUdtUnionV0 &&
          e.udtUnionV0.name === name) ||
        (e.type === ScSpecEntryKind.scSpecEntryUdtErrorEnumV0 &&
          e.udtErrorEnumV0.name === name) ||
        (e.type === ScSpecEntryKind.scSpecEntryEventV0 &&
          e.eventV0.name === name),
    );
    if (!entry) {
      throw new Error(`no such entry: ${name}`);
    }
    return entry;
  }

  /**
   * Converts a native JS value to an ScVal based on the given type.
   *
   * @param {any} val the native JS value
   * @param {ScSpecTypeDef} [ty] the expected type
   * @returns {ScVal} the converted ScVal
   *
   * @throws {Error} if value cannot be converted to the given type
   */
  nativeToScVal(val: any, ty: ScSpecTypeDef): ScVal {
    const t: ScSpecType = ty.type;
    const value = t;
    if (ty.type === ScSpecType.scSpecTypeUdt) {
      const udt = ty.udt;
      return this.nativeToUdt(val, udt.name);
    }
    if (ty.type === ScSpecType.scSpecTypeOption) {
      const opt = ty.option;
      if (val === null || val === undefined) {
        return ScVal.scvVoid();
      }
      return this.nativeToScVal(val, opt.valueType);
    }
    switch (typeof val) {
      case "object": {
        if (val === null) {
          switch (value) {
            case ScSpecType.scSpecTypeVoid:
              return ScVal.scvVoid();
            default:
              throw new TypeError(
                `Type ${ty} was not void, but value was null`,
              );
          }
        }

        if (SCVal.validate(val)) {
          ScVal.fromXDRObject(val);
          return ScVal.fromXDRObject(val); // should we copy?
        }

        if (val instanceof Address) {
          if (ty.type !== ScSpecType.scSpecTypeAddress) {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`,
            );
          }
          return val.toScVal();
        }

        if (val instanceof Contract) {
          if (ty.type !== ScSpecType.scSpecTypeAddress) {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`,
            );
          }
          return val.address().toScVal();
        }

        if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
          const copy = Uint8Array.from(val);
          switch (ty.type) {
            case ScSpecType.scSpecTypeBytesN: {
              const bytesN = ty.bytesN;
              if (copy.length !== bytesN.n) {
                throw new TypeError(
                  `expected ${bytesN.n} bytes, but got ${copy.length}`,
                );
              }
              //@ts-ignore
              return ScVal.scvBytes(copy);
            }
            case ScSpecType.scSpecTypeBytes:
              //@ts-ignore
              return ScVal.scvBytes(copy);
            default:
              throw new TypeError(
                `invalid type (${ty}) specified for Bytes and BytesN`,
              );
          }
        }
        if (Array.isArray(val)) {
          switch (ty.type) {
            case ScSpecType.scSpecTypeVec: {
              const vec = ty.vec;
              const elementType = vec.elementType;
              return ScVal.scvVec(
                val.map((v) => this.nativeToScVal(v, elementType)),
              );
            }
            case ScSpecType.scSpecTypeTuple: {
              const tup = ty.tuple;
              const valTypes = tup.valueTypes;
              if (val.length !== valTypes.length) {
                throw new TypeError(
                  `Tuple expects ${valTypes.length} values, but ${val.length} were provided`,
                );
              }
              return ScVal.scvVec(
                val.map((v, i) => this.nativeToScVal(v, valTypes[i])),
              );
            }
            case ScSpecType.scSpecTypeMap: {
              const map = ty.map;
              const keyType = map.keyType;
              const valueType = map.valueType;
              return ScVal.scvMap(
                val.map((entry) => {
                  const key = this.nativeToScVal(entry[0], keyType);
                  const mapVal = this.nativeToScVal(entry[1], valueType);
                  return { key, val: mapVal };
                }),
              );
            }

            default:
              throw new TypeError(
                `Type ${ty} was not vec, but value was Array`,
              );
          }
        }
        if (val.constructor === Map) {
          if (ty.type !== ScSpecType.scSpecTypeMap) {
            throw new TypeError(`Type ${ty} was not map, but value was Map`);
          }
          const scMap = ty.map;
          const map = val as Map<any, any>;
          const entries: ScMapEntry[] = [];
          const values = map.entries();
          let res = values.next();
          while (!res.done) {
            const [k, v] = res.value;
            const key = this.nativeToScVal(k, scMap.keyType);
            const mapval = this.nativeToScVal(v, scMap.valueType);
            entries.push({ key, val: mapval });
            res = values.next();
          }
          return ScVal.scvMap(entries);
        }

        if ((val.constructor?.name ?? "") !== "Object") {
          throw new TypeError(
            `cannot interpret ${
              val.constructor?.name
            } value as ScVal (${JSON.stringify(val)})`,
          );
        }

        throw new TypeError(
          `Received object ${val}  did not match the provided type ${ty}`,
        );
      }

      case "number":
      case "bigint": {
        switch (ty.type) {
          case ScSpecType.scSpecTypeU32:
            if (
              BigInt(val) < BigInt(Uint32.MIN_VALUE) ||
              BigInt(val) > BigInt(Uint32.MAX_VALUE)
            ) {
              throw new RangeError(`Value ${val} is out of range for U32`);
            }
            return ScVal.scvU32(Number(val));
          case ScSpecType.scSpecTypeI32:
            if (
              BigInt(val) < BigInt(Int32.MIN_VALUE) ||
              BigInt(val) > BigInt(Int32.MAX_VALUE)
            ) {
              throw new RangeError(`Value ${val} is out of range for I32`);
            }
            return ScVal.scvI32(Number(val));
          case ScSpecType.scSpecTypeU64:
            if (Uint64.isValid(BigInt(val))) return ScVal.scvU64(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for U64`);
          case ScSpecType.scSpecTypeI64:
            if (Int64.isValid(BigInt(val))) return ScVal.scvI64(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for I64`);
          case ScSpecType.scSpecTypeU128:
            if (Uint128Parts.isValid(BigInt(val)))
              return ScVal.scvU128(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for U128`);
          case ScSpecType.scSpecTypeI128:
            if (Int128Parts.isValid(BigInt(val)))
              return ScVal.scvI128(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for I128`);
          case ScSpecType.scSpecTypeU256:
            if (Uint256Parts.isValid(BigInt(val)))
              return ScVal.scvU256(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for U256`);
          case ScSpecType.scSpecTypeI256:
            if (Int256Parts.isValid(BigInt(val)))
              return ScVal.scvI256(BigInt(val));
            throw new RangeError(`Value ${val} is out of range for I256`);
          case ScSpecType.scSpecTypeTimepoint:
            if (TimePoint.isValid(BigInt(val)))
              return ScVal.scvTimepoint(BigInt(val));
            throw new RangeError(
              `Value ${val} is out of range for Timepoint (u64)`,
            );
          case ScSpecType.scSpecTypeDuration:
            if (Duration.isValid(BigInt(val)))
              return ScVal.scvDuration(BigInt(val));
            throw new RangeError(
              `Value ${val} is out of range for Duration (u64)`,
            );
          default:
            throw new TypeError(`invalid type (${ty}) specified for integer`);
        }
      }
      case "string":
        return stringToScVal(val, ty.type);

      case "boolean": {
        if (ty.type !== ScSpecType.scSpecTypeBool) {
          throw TypeError(`Type ${ty} was not bool, but value was bool`);
        }
        return ScVal.scvBool(val);
      }
      case "undefined": {
        if (!ty) {
          return ScVal.scvVoid();
        }
        switch (ty.type) {
          case ScSpecType.scSpecTypeVoid:
            return ScVal.scvVoid();
          default:
            throw new TypeError(
              `Type ${ty} was not void, but value was undefined`,
            );
        }
      }

      case "function": // FIXME: Is this too helpful?
        return this.nativeToScVal(val, ty);

      default:
        throw new TypeError(`failed to convert typeof ${typeof val} (${val})`);
    }
  }

  private nativeToUdt(val: any, name: string): ScVal {
    const entry = this.findEntry(name);
    switch (entry.type) {
      case ScSpecEntryKind.scSpecEntryUdtEnumV0:
        if (typeof val !== "number") {
          throw new TypeError(
            `expected number for enum ${name}, but got ${typeof val}`,
          );
        }
        return this.nativeToEnum(val as number, entry.udtEnumV0);
      case ScSpecEntryKind.scSpecEntryUdtStructV0:
        return this.nativeToStruct(val, entry.udtStructV0);
      case ScSpecEntryKind.scSpecEntryUdtUnionV0:
        return this.nativeToUnion(val, entry.udtUnionV0);
      default:
        throw new Error(`failed to parse udt ${name}`);
    }
  }

  private nativeToUnion(val: Union<any>, union_: ScSpecUdtUnionV0): ScVal {
    const entryName = val.tag;
    const caseFound = union_.cases.find((entry) => {
      const caseN =
        entry.type === ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0
          ? entry.voidCase.name
          : entry.tupleCase.name;
      return caseN === entryName;
    });
    if (!caseFound) {
      throw new TypeError(`no such enum entry: ${entryName} in ${union_}`);
    }
    const key = ScVal.scvSymbol(entryName);
    switch (caseFound.type) {
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0: {
        return ScVal.scvVec([key]);
      }
      case ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0: {
        const types = caseFound.tupleCase.type;
        if (Array.isArray(val.values)) {
          if (val.values.length !== types.length) {
            throw new TypeError(
              `union ${union_} expects ${types.length} values, but got ${val.values.length}`,
            );
          }
          const scvals = val.values.map((v, i) =>
            this.nativeToScVal(v, types[i]),
          );
          scvals.unshift(key);
          return ScVal.scvVec(scvals);
        }
        throw new Error(`failed to parse union case ${caseFound} with ${val}`);
      }
      default:
        throw new Error(`failed to parse union ${union_} with ${val}`);
    }
  }

  private nativeToStruct(val: any, struct: ScSpecUdtStructV0): ScVal {
    const fields = struct.fields;
    if (fields.some(isNumeric)) {
      if (!fields.every(isNumeric)) {
        throw new Error(
          "mixed numeric and non-numeric field names are not allowed",
        );
      }
      return ScVal.scvVec(
        fields.map((_, i) => this.nativeToScVal(val[i], fields[i].type)),
      );
    }
    return ScVal.scvMap(
      fields.map((field) => {
        const name = field.name;
        return {
          key: this.nativeToScVal(name, ScSpecTypeDef.scSpecTypeSymbol()),
          val: this.nativeToScVal(val[name], field.type),
        };
      }),
    );
  }

  private nativeToEnum(val: number, enum_: ScSpecUdtEnumV0): ScVal {
    if (enum_.cases.some((entry) => entry.value === val)) {
      return ScVal.scvU32(val);
    }
    throw new TypeError(`no such enum entry: ${val} in ${enum_}`);
  }

  /**
   * Converts an base64 encoded ScVal back to a native JS value based on the given type.
   *
   * @param {string} scv the base64 encoded ScVal
   * @param {ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValStrToNative<T>(scv: string, typeDef: ScSpecTypeDef): T {
    return this.scValToNative<T>(ScVal.fromXDR(scv, "base64"), typeDef);
  }

  /**
   * Converts an ScVal back to a native JS value based on the given type.
   *
   * @param {ScVal} scv the ScVal
   * @param {ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValToNative<T>(scv: ScVal, typeDef: ScSpecTypeDef): T {
    if (typeDef.type === ScSpecType.scSpecTypeOption) {
      switch (scv.type) {
        case ScValType.scvVoid:
          return null as T;
        default:
          return this.scValToNative(scv, typeDef.option.valueType);
      }
    }

    if (typeDef.type === ScSpecType.scSpecTypeUdt) {
      return this.scValUdtToNative(scv, typeDef.udt);
    }

    if (typeDef.type === ScSpecType.scSpecTypeResult) {
      if (scv.type === ScValType.scvError) {
        return this.scValToNative(scv, typeDef.result.errorType);
      }
      return this.scValToNative(scv, typeDef.result.okType);
    }

    // we use the verbose ScValType.<type> form here because it's faster
    // than string comparisons and the underlying constants never need to be
    // updated
    switch (scv.type) {
      case ScValType.scvVoid:
        return null as T;

      // these can be converted to bigints directly
      case ScValType.scvU64:
        return scv.u64 as unknown as T;
      case ScValType.scvI64:
        return scv.i64 as unknown as T;
      case ScValType.scvTimepoint:
        return scv.timepoint as unknown as T;
      case ScValType.scvDuration:
        return scv.duration as unknown as T;
      // these can be parsed by internal abstractions note that this can also
      // handle the above two cases, but it's not as efficient (another
      // type-check, parsing, etc.)
      case ScValType.scvU128:
        return scv.u128 as unknown as T;

      case ScValType.scvI128:
        return scv.i128 as unknown as T;
      case ScValType.scvU256:
        return scv.u256 as unknown as T;
      case ScValType.scvI256:
        return scv.i256 as unknown as T;

      case ScValType.scvVec: {
        if (typeDef.type === ScSpecType.scSpecTypeVec) {
          const vec = typeDef.vec;
          return (scv.vec ?? []).map((elm) =>
            this.scValToNative(elm, vec.elementType),
          ) as T;
        }
        if (typeDef.type === ScSpecType.scSpecTypeTuple) {
          const tuple = typeDef.tuple;
          const valTypes = tuple.valueTypes;
          return (scv.vec ?? []).map((elm, i) =>
            this.scValToNative(elm, valTypes[i]),
          ) as T;
        }
        throw new TypeError(`Type ${typeDef} was not vec, but ${scv} is`);
      }

      case ScValType.scvAddress:
        return Address.fromScVal(scv).toString() as T;

      case ScValType.scvMap: {
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeMap);

        const map = scv.map ?? [];
        if (typeDef.type === ScSpecType.scSpecTypeMap) {
          const typed = typeDef.map;
          const keyType = typed.keyType;
          const valueType = typed.valueType;
          const res = map.map((entry) => [
            this.scValToNative(entry.key, keyType),
            this.scValToNative(entry.val, valueType),
          ]) as T;
          return res;
        }
        throw new TypeError(
          `ScSpecType ${typeDef.type} was not map, but ${JSON.stringify(
            scv,
            null,
            2,
          )} is`,
        );
      }

      // these return the primitive type directly
      case ScValType.scvBool:
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeBool);
        return scv.b as T;
      case ScValType.scvU32:
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeU32);
        return scv.u32 as unknown as T;
      case ScValType.scvI32:
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeI32);
        return scv.i32 as unknown as T;
      case ScValType.scvBytes:
        return Buffer.from(scv.bytes) as unknown as T;

      case ScValType.scvString:
        if (typeDef.type !== ScSpecType.scSpecTypeString) {
          validateScSpecType(typeDef.type, ScSpecType.scSpecTypeString);
        }
        return scv.str as unknown as T;
      case ScValType.scvSymbol: {
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeSymbol);
        return scv.sym as T;
      }
      case ScValType.scvError:
        validateScSpecType(typeDef.type, ScSpecType.scSpecTypeError);

        switch (scv.error.type) {
          case ScErrorType.sceAuth:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceBudget:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceContext:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceContract:
            return new Error(scv.error.contractCode.toString()) as unknown as T;
          case ScErrorType.sceCrypto:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceEvents:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceObject:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceStorage:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceValue:
            return new Error(scv.error.code) as unknown as T;
          case ScErrorType.sceWasmVm:
            return new Error(scv.error.code) as unknown as T;
          default:
            throw new TypeError(
              `unknown error type: ${JSON.stringify(scv.error)}`,
            );
        }
      // in the fallthrough case, just return the underlying value directly
      default:
        throw new TypeError(
          `failed to convert ${JSON.stringify(
            scv,
            null,
            2,
          )} to native type from type ${typeDef.type}`,
        );
    }
  }

  private scValUdtToNative(scv: ScVal, udt: ScSpecTypeUdt): any {
    const entry = this.findEntry(udt.name);
    switch (entry.type) {
      case ScSpecEntryKind.scSpecEntryUdtEnumV0:
        return this.enumToNative(scv);
      case ScSpecEntryKind.scSpecEntryUdtStructV0:
        return this.structToNative(scv, entry.udtStructV0);
      case ScSpecEntryKind.scSpecEntryUdtUnionV0:
        return this.unionToNative(scv, entry.udtUnionV0);
      default:
        throw new Error(`failed to parse udt ${udt.name}: ${entry}`);
    }
  }

  private unionToNative(val: ScVal, udt: ScSpecUdtUnionV0): any {
    if (val.type !== ScValType.scvVec) {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a vec`);
    }
    const vec = val.vec;
    if (!vec) {
      throw new Error(`vec is undefined in ${JSON.stringify(val, null, 2)}`);
    }
    if (vec.length === 0 && udt.cases.length !== 0) {
      throw new Error(
        `${val} has length 0, but the there are at least one case in the union`,
      );
    }

    const scval = vec[0];
    if (scval.type !== ScValType.scvSymbol) {
      throw new Error(`${scval} is not a symbol`);
    }
    const name = scval.sym;
    const entry = udt.cases.find(findCase(name));
    if (!entry) {
      throw new Error(`failed to find entry ${name} in union ${udt.name}`);
    }
    const res: Union<any> = { tag: name };
    if (entry.type === ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0) {
      const tuple = entry.tupleCase;
      const ty = tuple.type;
      const values = ty.map((e, i) => this.scValToNative(vec![i + 1], e));
      res.values = values;
    }
    return res;
  }

  private structToNative(val: ScVal, udt: ScSpecUdtStructV0): any {
    const res: any = {};
    const fields = udt.fields;
    if (fields.some(isNumeric) && val.type === ScValType.scvVec) {
      const r = val.vec?.map((entry, i) =>
        this.scValToNative(entry, fields[i].type),
      );
      return r;
    } else if (val.type === ScValType.scvMap) {
      val.map?.forEach((entry, i) => {
        const field = fields[i];
        res[field.name] = this.scValToNative(entry.val, field.type);
      });
    }
    return res;
  }

  private enumToNative(scv: ScVal): number {
    if (scv.type !== ScValType.scvU32) {
      throw new Error(`Enum must have a u32 value`);
    }
    const num = scv.u32;
    return num;
  }

  /**
   * Gets the XDR error cases from the spec.
   *
   * @returns all contract functions
   *
   */
  errorCases(): ScSpecUdtErrorEnumCaseV0[] {
    return this.entries
      .filter(
        (entry) => entry.type === ScSpecEntryKind.scSpecEntryUdtErrorEnumV0,
      )
      .flatMap((entry) => entry.udtErrorEnumV0.cases);
  }

  /**
   * Converts the contract spec to a JSON schema.
   *
   * If `funcName` is provided, the schema will be a reference to the function schema.
   *
   * @param {string} [funcName] the name of the function to convert
   * @returns {JSONSchema7} the converted JSON schema
   *
   * @throws {Error} if the contract spec is invalid
   */
  jsonSchema(funcName?: string): JSONSchema7 {
    const definitions: { [key: string]: JSONSchema7Definition } = {};

    this.entries.forEach((entry) => {
      switch (entry.type) {
        case ScSpecEntryKind.scSpecEntryUdtEnumV0: {
          const udt = entry.udtEnumV0;
          definitions[udt.name] = enumToJsonSchema(udt);
          break;
        }
        case ScSpecEntryKind.scSpecEntryUdtStructV0: {
          const udt = entry.udtStructV0;
          definitions[udt.name] = structToJsonSchema(udt);
          break;
        }
        case ScSpecEntryKind.scSpecEntryUdtUnionV0: {
          const udt = entry.udtUnionV0;
          definitions[udt.name] = unionToJsonSchema(udt);
          break;
        }
        case ScSpecEntryKind.scSpecEntryFunctionV0: {
          const fn = entry.functionV0;
          const fnName = fn.name;
          const { input } = functionToJsonSchema(fn);
          // @ts-ignore
          definitions[fnName] = input;
          break;
        }
        case ScSpecEntryKind.scSpecEntryUdtErrorEnumV0: {
          // console.debug("Error enums not supported yet");
        }
      }
    });

    const res: JSONSchema7 = {
      $schema: "http://json-schema.org/draft-07/schema#",
      definitions: { ...PRIMITIVE_DEFINITONS, ...definitions },
    };
    if (funcName) {
      res.$ref = `#/definitions/${funcName}`;
    }
    return res;
  }
}
