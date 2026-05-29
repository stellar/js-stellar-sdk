import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import {
  type ScIntType,
  XdrLargeInt,
  Address,
  Contract,
  scValToBigInt,
} from "../base/index.js";
import { Ok, Err } from "./rust_result.js";
import { processSpecEntryStream } from "./utils.js";
import { specFromWasm } from "./wasm_spec_parser.js";
import {
  Int32,
  ScBytes,
  ScMapEntry,
  ScSpecEntry,
  ScSpecFunctionInputV0,
  ScSpecFunctionV0,
  ScSpecTypeDef,
  ScSpecTypeUdt,
  ScSpecUdtEnumV0,
  ScSpecUdtErrorEnumCaseV0,
  ScSpecUdtErrorEnumV0,
  ScSpecUdtStructFieldV0,
  ScSpecUdtStructV0,
  ScSpecUdtUnionCaseV0,
  ScSpecUdtUnionV0,
  ScVal,
  Uint32,
  Uint64,
  XdrString,
} from "../xdr/index.js";

export interface Union<T> {
  tag: string;
  values?: T;
}

function enumToJsonSchema(udt: ScSpecUdtEnumV0): any {
  const description = udt.doc.toString();
  const cases = udt.cases;
  const oneOf: any[] = [];
  cases.forEach((aCase) => {
    const title = aCase.name.toString();
    const desc = aCase.doc.toString();
    oneOf.push({
      description: desc,
      title,
      enum: [aCase.value],
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
  return /^\d+$/.test(field.name.toString());
}

function readObj(args: object, input: ScSpecFunctionInputV0): any {
  const inputName = input.name.toString();
  const entry = Object.entries(args).find(([name]) => name === inputName);
  if (!entry) {
    throw new Error(`Missing field ${inputName}`);
  }
  return entry[1];
}

function findCase(name: string) {
  return function matches(entry: ScSpecUdtUnionCaseV0) {
    switch (entry.type) {
      case "scSpecUdtUnionCaseTupleV0": {
        const tuple = entry.value;
        return tuple.name.toString() === name;
      }
      case "scSpecUdtUnionCaseVoidV0": {
        const voidCase = entry.value;
        return voidCase.name.toString() === name;
      }
      default:
        return false;
    }
  };
}

function stringToScVal(str: string, ty: string): ScVal {
  switch (ty) {
    case "scSpecTypeString":
      return ScVal.scvString(str);
    case "scSpecTypeSymbol":
      return ScVal.scvSymbol(str);
    case "scSpecTypeAddress":
    case "scSpecTypeMuxedAddress":
      return Address.fromString(str).toScVal();
    case "scSpecTypeU64":
      return new XdrLargeInt("u64", str).toScVal();
    case "scSpecTypeI64":
      return new XdrLargeInt("i64", str).toScVal();
    case "scSpecTypeU128":
      return new XdrLargeInt("u128", str).toScVal();
    case "scSpecTypeI128":
      return new XdrLargeInt("i128", str).toScVal();
    case "scSpecTypeU256":
      return new XdrLargeInt("u256", str).toScVal();
    case "scSpecTypeI256":
      return new XdrLargeInt("i256", str).toScVal();
    case "scSpecTypeBytes":
    case "scSpecTypeBytesN":
      return ScVal.scvBytes(
        new ScBytes(Uint8Array.from(Buffer.from(str, "base64"))),
      );
    case "scSpecTypeTimepoint": {
      return ScVal.scvTimepoint(Uint64(str));
    }
    case "scSpecTypeDuration": {
      return ScVal.scvDuration(Uint64(str));
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
    case "scSpecTypeVal": {
      ref = "Val";
      break;
    }
    case "scSpecTypeBool": {
      return { type: "boolean" };
    }
    case "scSpecTypeVoid": {
      return { type: "null" };
    }
    case "scSpecTypeError": {
      ref = "Error";
      break;
    }
    case "scSpecTypeU32": {
      ref = "U32";
      break;
    }
    case "scSpecTypeI32": {
      ref = "I32";
      break;
    }
    case "scSpecTypeU64": {
      ref = "U64";
      break;
    }
    case "scSpecTypeI64": {
      ref = "I64";
      break;
    }
    case "scSpecTypeTimepoint": {
      ref = "Timepoint";
      break;
    }
    case "scSpecTypeDuration": {
      ref = "Duration";
      break;
    }
    case "scSpecTypeU128": {
      ref = "U128";
      break;
    }
    case "scSpecTypeI128": {
      ref = "I128";
      break;
    }
    case "scSpecTypeU256": {
      ref = "U256";
      break;
    }
    case "scSpecTypeI256": {
      ref = "I256";
      break;
    }
    case "scSpecTypeBytes": {
      ref = "DataUrl";
      break;
    }
    case "scSpecTypeString": {
      ref = "ScString";
      break;
    }
    case "scSpecTypeSymbol": {
      ref = "ScSymbol";
      break;
    }
    case "scSpecTypeAddress": {
      ref = "Address";
      break;
    }
    case "scSpecTypeMuxedAddress": {
      ref = "MuxedAddress";
      break;
    }
    case "scSpecTypeOption": {
      const opt = typeDef.value;
      return typeRef(opt.valueType);
    }
    case "scSpecTypeResult": {
      const result = typeDef.value;
      return typeRef(result.okType);
    }
    case "scSpecTypeVec": {
      const arr = typeDef.value;
      const reference = typeRef(arr.elementType);
      return {
        type: "array",
        items: reference,
      };
    }
    case "scSpecTypeMap": {
      const map = typeDef.value;
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
    case "scSpecTypeTuple": {
      const tuple = typeDef.value;
      const minItems = tuple.valueTypes.length;
      const maxItems = minItems;
      const items = tuple.valueTypes.map(typeRef);
      return { type: "array", items, minItems, maxItems };
    }
    case "scSpecTypeBytesN": {
      const arr = typeDef.value;
      return {
        $ref: "#/definitions/DataUrl",
        maxLength: arr.n,
      };
    }
    case "scSpecTypeUdt": {
      const udt = typeDef.value;
      ref = udt.name.toString();
      break;
    }
  }
  return { $ref: `#/definitions/${ref}` };
}

type Func = { input: JSONSchema7; output: JSONSchema7 };

function isRequired(typeDef: ScSpecTypeDef): boolean {
  return typeDef.type !== "scSpecTypeOption";
}

function argsAndRequired(input: { type: ScSpecTypeDef; name: XdrString }[]): {
  properties: object;
  required?: string[];
} {
  const properties: any = {};
  const required: string[] = [];
  input.forEach((arg) => {
    const aType = arg.type;
    const name = arg.name.toString();
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
  const description = udt.doc.toString();
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
  const description = func.doc.toString();
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
  const description = udt.doc.toString();
  const cases = udt.cases;
  const oneOf: any[] = [];
  cases.forEach((aCase) => {
    switch (aCase.type) {
      case "scSpecUdtUnionCaseVoidV0": {
        const c = aCase.value;
        const title = c.name.toString();
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
      case "scSpecUdtUnionCaseTupleV0": {
        const c = aCase.value;
        const title = c.name.toString();
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
          ScSpecEntry.fromXdr(s, "base64"),
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
      .filter((entry) => entry.type === "scSpecEntryFunctionV0")
      .map((entry) => entry.value);
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
    if (entry.type !== "scSpecEntryFunctionV0") {
      throw new Error(`${name} is not a function`);
    }
    return entry.value;
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
    return fn.inputs.map((input: ScSpecFunctionInputV0) =>
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
        ? ScVal.fromXdr(val_or_base64, "base64")
        : val_or_base64;
    const func = this.getFunc(name);
    const outputs = func.outputs;
    if (outputs.length === 0) {
      if (val.type !== "scvVoid") {
        throw new Error(`Expected void, got ${val.type}`);
      }
      return null;
    }
    if (outputs.length > 1) {
      throw new Error(`Multiple outputs not supported`);
    }
    const output = outputs[0];
    if (output.type === "scSpecTypeResult") {
      if (val.type === "scvError") {
        return new Err({
          message: Buffer.from(val.value.toXdr()).toString("base64"),
        });
      }
      return new Ok(this.scValToNative(val, output.value.okType));
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
    const entry = this.entries.find((e) => {
      if (e.type === "scSpecEntryFunctionV0") {
        return e.value.name.toString() === name;
      }
      // For UDT entries (struct/union/enum/errorEnum/eventV0), value has .name
      return (e.value as { name: XdrString }).name.toString() === name;
    });
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
    const tyType = ty.type;
    if (tyType === "scSpecTypeUdt") {
      const udt = ty.value;
      return this.nativeToUdt(val, udt.name.toString());
    }
    if (tyType === "scSpecTypeOption") {
      const opt = ty.value;
      if (val === null || val === undefined) {
        return ScVal.scvVoid();
      }
      return this.nativeToScVal(val, opt.valueType);
    }
    switch (typeof val) {
      case "object": {
        if (val === null) {
          switch (tyType) {
            case "scSpecTypeVoid":
              return ScVal.scvVoid();
            default:
              throw new TypeError(
                `Type ${ty} was not void, but value was null`,
              );
          }
        }

        if (ScVal.is(val)) {
          return val;
        }

        if (val instanceof Address) {
          if (ty.type !== "scSpecTypeAddress") {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`,
            );
          }
          return val.toScVal();
        }

        if (val instanceof Contract) {
          if (ty.type !== "scSpecTypeAddress") {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`,
            );
          }
          return val.address().toScVal();
        }

        if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
          const copy = Uint8Array.from(val);
          switch (tyType) {
            case "scSpecTypeBytesN": {
              const bytesN = ty.value;
              if (copy.length !== bytesN.n) {
                throw new TypeError(
                  `expected ${bytesN.n} bytes, but got ${copy.length}`,
                );
              }
              return ScVal.scvBytes(new ScBytes(copy));
            }
            case "scSpecTypeBytes":
              return ScVal.scvBytes(new ScBytes(copy));
            default:
              throw new TypeError(
                `invalid type (${ty}) specified for Bytes and BytesN`,
              );
          }
        }
        if (Array.isArray(val)) {
          switch (tyType) {
            case "scSpecTypeVec": {
              const vec = ty.value;
              const elementType = vec.elementType;
              return ScVal.scvVec(
                val.map((v) => this.nativeToScVal(v, elementType)),
              );
            }
            case "scSpecTypeTuple": {
              const tup = ty.value;
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
            case "scSpecTypeMap": {
              const map = ty.value;
              const keyType = map.keyType;
              const valueType = map.valueType;
              return ScVal.scvMap(
                val.map((entry) => {
                  const key = this.nativeToScVal(entry[0], keyType);
                  const mapVal = this.nativeToScVal(entry[1], valueType);
                  return new ScMapEntry({ key, val: mapVal });
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
          if (tyType !== "scSpecTypeMap") {
            throw new TypeError(`Type ${ty} was not map, but value was Map`);
          }
          const scMap = ty.value;
          const map = val as Map<any, any>;
          const entries: ScMapEntry[] = [];
          const values = map.entries();
          let res = values.next();
          while (!res.done) {
            const [k, v] = res.value;
            const key = this.nativeToScVal(k, scMap.keyType);
            const mapval = this.nativeToScVal(v, scMap.valueType);
            entries.push(new ScMapEntry({ key, val: mapval }));
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
        switch (tyType) {
          case "scSpecTypeU32":
            if (
              BigInt(val) < BigInt(Uint32.MIN_VALUE) ||
              BigInt(val) > BigInt(Uint32.MAX_VALUE)
            ) {
              throw new RangeError(`Value ${val} is out of range for U32`);
            }
            return ScVal.scvU32(Number(val));
          case "scSpecTypeI32":
            if (
              BigInt(val) < BigInt(Int32.MIN_VALUE) ||
              BigInt(val) > BigInt(Int32.MAX_VALUE)
            ) {
              throw new RangeError(`Value ${val} is out of range for I32`);
            }
            return ScVal.scvI32(Number(val));
          case "scSpecTypeU64":
          case "scSpecTypeI64":
          case "scSpecTypeU128":
          case "scSpecTypeI128":
          case "scSpecTypeU256":
          case "scSpecTypeI256":
          case "scSpecTypeTimepoint":
          case "scSpecTypeDuration": {
            const intType = tyType.substring(10).toLowerCase() as ScIntType;
            return new XdrLargeInt(intType, val as bigint).toScVal();
          }
          default:
            throw new TypeError(`invalid type (${ty}) specified for integer`);
        }
      }
      case "string":
        return stringToScVal(val, tyType);

      case "boolean": {
        if (tyType !== "scSpecTypeBool") {
          throw TypeError(`Type ${ty} was not bool, but value was bool`);
        }
        return ScVal.scvBool(val);
      }
      case "undefined": {
        if (!ty) {
          return ScVal.scvVoid();
        }
        switch (tyType) {
          case "scSpecTypeVoid":
            return ScVal.scvVoid();
          default:
            throw new TypeError(
              `Type ${ty} was not void, but value was undefined`,
            );
        }
      }

      case "function": // FIXME: Is this too helpful?
        return this.nativeToScVal(val(), ty);

      default:
        throw new TypeError(`failed to convert typeof ${typeof val} (${val})`);
    }
  }

  private nativeToUdt(val: any, name: string): ScVal {
    const entry = this.findEntry(name);
    switch (entry.type) {
      case "scSpecEntryUdtEnumV0":
        if (typeof val !== "number") {
          throw new TypeError(
            `expected number for enum ${name}, but got ${typeof val}`,
          );
        }
        return this.nativeToEnum(val as number, entry.value);
      case "scSpecEntryUdtStructV0":
        return this.nativeToStruct(val, entry.value);
      case "scSpecEntryUdtUnionV0":
        return this.nativeToUnion(val, entry.value);
      default:
        throw new Error(`failed to parse udt ${name}`);
    }
  }

  private nativeToUnion(val: Union<any>, union_: ScSpecUdtUnionV0): ScVal {
    const entryName = val.tag;
    const caseFound = union_.cases.find((entry: ScSpecUdtUnionCaseV0) => {
      return entry.value.name.toString() === entryName;
    });
    if (!caseFound) {
      throw new TypeError(`no such enum entry: ${entryName} in ${union_}`);
    }
    const key = ScVal.scvSymbol(entryName);
    switch (caseFound.type) {
      case "scSpecUdtUnionCaseVoidV0": {
        return ScVal.scvVec([key]);
      }
      case "scSpecUdtUnionCaseTupleV0": {
        const types = caseFound.value.type;
        if (Array.isArray(val.values)) {
          if (val.values.length !== types.length) {
            throw new TypeError(
              `union ${union_} expects ${types.length} values, but got ${val.values.length}`,
            );
          }
          const scvals = val.values.map((v: any, i: number) =>
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
        fields.map((_: ScSpecUdtStructFieldV0, i: number) =>
          this.nativeToScVal(val[i], fields[i].type),
        ),
      );
    }
    return ScVal.scvMap(
      fields.map((field: ScSpecUdtStructFieldV0) => {
        const name = field.name.toString();
        return new ScMapEntry({
          key: this.nativeToScVal(name, ScSpecTypeDef.scSpecTypeSymbol()),
          val: this.nativeToScVal(val[name], field.type),
        });
      }),
    );
  }

  private nativeToEnum(val: number, enum_: ScSpecUdtEnumV0): ScVal {
    if (enum_.cases.some((entry: { value: number }) => entry.value === val)) {
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
    return this.scValToNative<T>(ScVal.fromXdr(scv, "base64"), typeDef);
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
    const tyType = typeDef.type;

    if (tyType === "scSpecTypeOption") {
      switch (scv.type) {
        case "scvVoid":
          return null as T;
        default:
          return this.scValToNative(scv, typeDef.value.valueType);
      }
    }

    if (tyType === "scSpecTypeUdt") {
      return this.scValUdtToNative(scv, typeDef.value);
    }

    switch (scv.type) {
      case "scvVoid":
        return null as T;

      // these can be converted to bigints directly
      case "scvU64":
      case "scvI64":
      case "scvTimepoint":
      case "scvDuration":
      // these can be parsed by internal abstractions note that this can also
      // handle the above two cases, but it's not as efficient (another
      // type-check, parsing, etc.)
      case "scvU128":
      case "scvI128":
      case "scvU256":
      case "scvI256":
        return scValToBigInt(scv) as T;

      case "scvVec": {
        if (tyType === "scSpecTypeVec") {
          const vec = typeDef.value;
          return (scv.value ?? []).map((elm: ScVal) =>
            this.scValToNative(elm, vec.elementType),
          ) as T;
        }
        if (tyType === "scSpecTypeTuple") {
          const tuple = typeDef.value;
          const valTypes = tuple.valueTypes;
          return (scv.value ?? []).map((elm: ScVal, i: number) =>
            this.scValToNative(elm, valTypes[i]),
          ) as T;
        }
        throw new TypeError(`Type ${typeDef} was not vec, but ${scv} is`);
      }

      case "scvAddress":
        return Address.fromScVal(scv).toString() as T;

      case "scvMap": {
        const map = scv.value ?? [];
        if (tyType === "scSpecTypeMap") {
          const typed = typeDef.value;
          const keyType = typed.keyType;
          const valueType = typed.valueType;
          const res = map.map((entry: ScMapEntry) => [
            this.scValToNative(entry.key, keyType),
            this.scValToNative(entry.val, valueType),
          ]) as T;
          return res;
        }
        throw new TypeError(
          `ScSpecType ${tyType} was not map, but ${JSON.stringify(
            scv,
            null,
            2,
          )} is`,
        );
      }

      // these return the primitive type directly
      case "scvBool":
      case "scvU32":
      case "scvI32":
        return scv.value as T;
      case "scvBytes":
        return scv.value.value as T;

      case "scvString":
      case "scvSymbol": {
        if (tyType !== "scSpecTypeString" && tyType !== "scSpecTypeSymbol") {
          throw new Error(
            `ScSpecType ${tyType} was not string or symbol, but ${JSON.stringify(scv, null, 2)} is`,
          );
        }
        return scv.value?.toString() as T;
      }

      // in the fallthrough case, just return the underlying value directly
      default:
        throw new TypeError(
          `failed to convert ${JSON.stringify(
            scv,
            null,
            2,
          )} to native type from type ${tyType}`,
        );
    }
  }

  private scValUdtToNative(scv: ScVal, udt: ScSpecTypeUdt): any {
    const entry = this.findEntry(udt.name.toString());
    switch (entry.type) {
      case "scSpecEntryUdtEnumV0":
        return this.enumToNative(scv);
      case "scSpecEntryUdtStructV0":
        return this.structToNative(scv, entry.value);
      case "scSpecEntryUdtUnionV0":
        return this.unionToNative(scv, entry.value);
      default:
        throw new Error(`failed to parse udt ${udt.name.toString()}: ${entry}`);
    }
  }

  private unionToNative(val: ScVal, udt: ScSpecUdtUnionV0): any {
    if (val.type !== "scvVec") {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a vec`);
    }
    const vec = val.value;
    if (!vec) {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a vec`);
    }
    if (vec.length === 0 && udt.cases.length !== 0) {
      throw new Error(
        `${val} has length 0, but the there are at least one case in the union`,
      );
    }
    if (vec[0].type !== "scvSymbol") {
      throw new Error(`${vec[0]} is not a symbol`);
    }
    const name = vec[0].value.toString();
    const entry = udt.cases.find(findCase(name));
    if (!entry) {
      throw new Error(
        `failed to find entry ${name} in union ${udt.name.toString()}`,
      );
    }
    const res: Union<any> = { tag: name };
    if (entry.type === "scSpecUdtUnionCaseTupleV0") {
      const tuple = entry.value;
      const ty = tuple.type;
      const values = ty.map((e: ScSpecTypeDef, i: number) =>
        this.scValToNative(vec![i + 1], e),
      );
      res.values = values;
    }
    return res;
  }

  private structToNative(val: ScVal, udt: ScSpecUdtStructV0): any {
    const res: any = {};
    const fields = udt.fields;
    // Tuple-like structs (numeric field names) are encoded as scvVec; regular
    // structs are encoded as scvMap. Match the encoding side in
    // `nativeToStruct`.
    if (fields.some(isNumeric)) {
      if (val.type !== "scvVec") {
        throw new Error(
          `${JSON.stringify(val, null, 2)} is not a vec (expected for tuple-like struct)`,
        );
      }
      const vec = val.value ?? [];
      return vec.map((elm: ScVal, i: number) =>
        this.scValToNative(elm, fields[i].type),
      );
    }
    if (val.type !== "scvMap") {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a map`);
    }
    const entries = val.value ?? [];
    entries.forEach((entry: ScMapEntry, i: number) => {
      const field = fields[i];
      res[field.name.toString()] = this.scValToNative(entry.val, field.type);
    });
    return res;
  }

  private enumToNative(scv: ScVal): number {
    if (scv.type !== "scvU32") {
      throw new Error(`Enum must have a u32 value`);
    }
    const num = scv.value;
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
      .filter((entry) => entry.type === "scSpecEntryUdtErrorEnumV0")
      .flatMap((entry) => (entry.value as ScSpecUdtErrorEnumV0).cases);
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
        case "scSpecEntryUdtEnumV0": {
          const udt = entry.value;
          definitions[udt.name.toString()] = enumToJsonSchema(udt);
          break;
        }
        case "scSpecEntryUdtStructV0": {
          const udt = entry.value;
          definitions[udt.name.toString()] = structToJsonSchema(udt);
          break;
        }
        case "scSpecEntryUdtUnionV0": {
          const udt = entry.value;
          definitions[udt.name.toString()] = unionToJsonSchema(udt);
          break;
        }
        case "scSpecEntryFunctionV0": {
          const fn = entry.value;
          const fnName = fn.name.toString();
          const { input } = functionToJsonSchema(fn);
          // @ts-ignore
          definitions[fnName] = input;
          break;
        }
        case "scSpecEntryUdtErrorEnumV0": {
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
