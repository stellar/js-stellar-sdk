import {
  Address,
  Contract,
  ScIntType,
  XdrLargeInt,
  scValToBigInt,
  xdr
} from '@stellar/stellar-base';

export interface Union<T> {
  tag: string;
  values?: T;
}

/**
 * Provides a ContractSpec class which can contains the XDR types defined by the contract.
 * This allows the class to be used to convert between native and raw `xdr.ScVal`s.
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
export class ContractSpec {
  public entries: xdr.ScSpecEntry[] = [];

  /**
   * Constructs a new ContractSpec from an array of XDR spec entries.
   *
   * @param {xdr.ScSpecEntry[] | string[]} entries the XDR spec entries
   *
   * @throws {Error} if entries is invalid
   */
  constructor(entries: xdr.ScSpecEntry[] | string[]) {
    if (entries.length == 0) {
      throw new Error('Contract spec must have at least one entry');
    }
    let entry = entries[0];
    if (typeof entry === 'string') {
      this.entries = (entries as string[]).map((s) =>
        xdr.ScSpecEntry.fromXDR(s, 'base64')
      );
    } else {
      this.entries = entries as xdr.ScSpecEntry[];
    }
  }
  /**
   * Gets the XDR function spec for the given function name.
   *
   * @param {string} name the name of the function
   * @returns {xdr.ScSpecFunctionV0} the function spec
   *
   * @throws {Error} if no function with the given name exists
   */
  getFunc(name: string): xdr.ScSpecFunctionV0 {
    let entry = this.findEntry(name);
    if (
      entry.switch().value !== xdr.ScSpecEntryKind.scSpecEntryFunctionV0().value
    ) {
      throw new Error(`${name} is not a function`);
    }
    return entry.value() as xdr.ScSpecFunctionV0;
  }

  /**
   * Converts native JS arguments to ScVals for calling a contract function.
   *
   * @param {string} name the name of the function
   * @param {Object} args the arguments object
   * @returns {xdr.ScVal[]} the converted arguments
   *
   * @throws {Error} if argument is missing or incorrect type
   *
   * @example
   * ```js
   * const args = {
   *   arg1: 'value1',
   *   arg2: 1234
   * };
   * const scArgs = contractSpec.funcArgsToScVals('funcName', args);
   * ```
   */
  funcArgsToScVals(name: string, args: object): xdr.ScVal[] {
    let fn = this.getFunc(name);
    return fn
      .inputs()
      .map((input) => this.nativeToScVal(readObj(args, input), input.type()));
  }

  /**
   * Converts the result ScVal of a function call to a native JS value.
   *
   * @param {string} name the name of the function
   * @param {xdr.ScVal | string} val_or_base64 the result ScVal or base64 encoded string
   * @returns {any} the converted native value
   *
   * @throws {Error} if return type mismatch or invalid input
   *
   * @example
   * ```js
   * const resultScv = 'AAA=='; // Base64 encoded ScVal
   * const result = contractSpec.funcResToNative('funcName', resultScv);
   * ```
   */
  funcResToNative(name: string, val_or_base64: xdr.ScVal | string): any {
    let val =
      typeof val_or_base64 === 'string'
        ? xdr.ScVal.fromXDR(val_or_base64, 'base64')
        : val_or_base64;
    let func = this.getFunc(name);
    let outputs = func.outputs();
    if (outputs.length === 0) {
      let type = val.switch();
      if (type.value !== xdr.ScValType.scvVoid().value) {
        throw new Error(`Expected void, got ${type.name}`);
      }
      return null;
    }
    if (outputs.length > 1) {
      throw new Error(`Multiple outputs not supported`);
    }
    let output = outputs[0];
    if (output.switch().value === xdr.ScSpecType.scSpecTypeResult().value) {
      return this.scValToNative(val, output.result().okType());
    }
    return this.scValToNative(val, output);
  }

  /**
   * Finds the XDR spec entry for the given name.
   *
   * @param {string} name the name to find
   * @returns {xdr.ScSpecEntry} the entry
   *
   * @throws {Error} if no entry with the given name exists
   */
  findEntry(name: string): xdr.ScSpecEntry {
    let entry = this.entries.find(
      (entry) => entry.value().name().toString() === name
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
   * @param {xdr.ScSpecTypeDef} [ty] the expected type
   * @returns {xdr.ScVal} the converted ScVal
   *
   * @throws {Error} if value cannot be converted to the given type
   */
  nativeToScVal(val: any, ty: xdr.ScSpecTypeDef): xdr.ScVal {
    let t: xdr.ScSpecType = ty.switch();
    let value = t.value;
    if (t.value === xdr.ScSpecType.scSpecTypeUdt().value) {
      let udt = ty.value() as xdr.ScSpecTypeUdt;
      return this.nativeToUdt(val, udt.name().toString());
    }
    if (value === xdr.ScSpecType.scSpecTypeOption().value) {
      let opt = ty.value() as xdr.ScSpecTypeOption;
      if (val === undefined) {
        return xdr.ScVal.scvVoid();
      }
      return this.nativeToScVal(val, opt.valueType());
    }

    switch (typeof val) {
      case 'object': {
        if (val === null) {
          switch (value) {
            case xdr.ScSpecType.scSpecTypeVoid().value:
              return xdr.ScVal.scvVoid();
            default:
              throw new TypeError(
                `Type ${ty} was not void, but value was null`
              );
          }
        }

        if (val instanceof xdr.ScVal) {
          return val; // should we copy?
        }

        if (val instanceof Address) {
          if (ty.switch().value !== xdr.ScSpecType.scSpecTypeAddress().value) {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`
            );
          }
          return val.toScVal();
        }

        if (val instanceof Contract) {
          if (ty.switch().value !== xdr.ScSpecType.scSpecTypeAddress().value) {
            throw new TypeError(
              `Type ${ty} was not address, but value was Address`
            );
          }
          return val.address().toScVal();
        }

        if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
          const copy = Uint8Array.from(val);
          switch (value) {
            case xdr.ScSpecType.scSpecTypeBytesN().value: {
              let bytes_n = ty.value() as xdr.ScSpecTypeBytesN;
              if (copy.length !== bytes_n.n()) {
                throw new TypeError(
                  `expected ${bytes_n.n()} bytes, but got ${copy.length}`
                );
              }
              //@ts-ignore
              return xdr.ScVal.scvBytes(copy);
            }
            case xdr.ScSpecType.scSpecTypeBytes().value:
              //@ts-ignore
              return xdr.ScVal.scvBytes(copy);
            default:
              throw new TypeError(
                `invalid type (${ty}) specified for Bytes and BytesN`
              );
          }
        }
        if (Array.isArray(val)) {
          if (xdr.ScSpecType.scSpecTypeVec().value === value) {
            let vec = ty.value() as xdr.ScSpecTypeVec;
            let elementType = vec.elementType();
            return xdr.ScVal.scvVec(
              val.map((v) => this.nativeToScVal(v, elementType))
            );
          } else if (xdr.ScSpecType.scSpecTypeTuple().value === value) {
            let tup = ty.value() as xdr.ScSpecTypeTuple;
            let valTypes = tup.valueTypes();
            if (val.length !== valTypes.length) {
              throw new TypeError(
                `Tuple expects ${valTypes.length} values, but ${val.length} were provided`
              );
            }
            return xdr.ScVal.scvVec(
              val.map((v, i) => this.nativeToScVal(v, valTypes[i]))
            );
          } else {
            throw new TypeError(`Type ${ty} was not vec, but value was Array`);
          }
        }
        if (val.constructor === Map) {
          if (value !== xdr.ScSpecType.scSpecTypeMap().value) {
            throw new TypeError(`Type ${ty} was not map, but value was Map`);
          }
          let scMap = ty.value() as xdr.ScSpecTypeMap;
          let map = val as Map<any, any>;
          let entries: xdr.ScMapEntry[] = [];
          let values = map.entries();
          let res = values.next();
          while (!res.done) {
            let [k, v] = res.value;
            let key = this.nativeToScVal(k, scMap.keyType());
            let val = this.nativeToScVal(v, scMap.valueType());
            entries.push(new xdr.ScMapEntry({ key, val }));
            res = values.next();
          }
          return xdr.ScVal.scvMap(entries);
        }

        if ((val.constructor?.name ?? '') !== 'Object') {
          throw new TypeError(
            `cannot interpret ${val.constructor
              ?.name} value as ScVal (${JSON.stringify(val)})`
          );
        }

        throw new TypeError(
          `Received object ${val}  did not match the provided type ${ty}`
        );
      }

      case 'number':
      case 'bigint': {
        switch (value) {
          case xdr.ScSpecType.scSpecTypeU32().value:
            return xdr.ScVal.scvU32(val as number);
          case xdr.ScSpecType.scSpecTypeI32().value:
            return xdr.ScVal.scvI32(val as number);
          case xdr.ScSpecType.scSpecTypeU64().value:
          case xdr.ScSpecType.scSpecTypeI64().value:
          case xdr.ScSpecType.scSpecTypeU128().value:
          case xdr.ScSpecType.scSpecTypeI128().value:
          case xdr.ScSpecType.scSpecTypeU256().value:
          case xdr.ScSpecType.scSpecTypeI256().value: {
            const intType = t.name.substring(10).toLowerCase() as ScIntType;
            return new XdrLargeInt(intType, val as bigint).toScVal();
          }
          default:
            throw new TypeError(`invalid type (${ty}) specified for integer`);
        }
      }
      case 'string':
        return stringToScVal(val, t);

      case 'boolean': {
        if (value !== xdr.ScSpecType.scSpecTypeBool().value) {
          throw TypeError(`Type ${ty} was not bool, but value was bool`);
        }
        return xdr.ScVal.scvBool(val);
      }
      case 'undefined': {
        if (!ty) {
          return xdr.ScVal.scvVoid();
        }
        switch (value) {
          case xdr.ScSpecType.scSpecTypeVoid().value:
          case xdr.ScSpecType.scSpecTypeOption().value:
            return xdr.ScVal.scvVoid();
          default:
            throw new TypeError(
              `Type ${ty} was not void, but value was undefined`
            );
        }
      }

      case 'function': // FIXME: Is this too helpful?
        return this.nativeToScVal(val(), ty);

      default:
        throw new TypeError(`failed to convert typeof ${typeof val} (${val})`);
    }
  }

  private nativeToUdt(val: any, name: string): xdr.ScVal {
    let entry = this.findEntry(name);
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        if (typeof val !== 'number') {
          throw new TypeError(
            `expected number for enum ${name}, but got ${typeof val}`
          );
        }
        return this.nativeToEnum(
          val as number,
          entry.value() as xdr.ScSpecUdtEnumV0
        );
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.nativeToStruct(val, entry.value() as xdr.ScSpecUdtStructV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.nativeToUnion(val, entry.value() as xdr.ScSpecUdtUnionV0);
      default:
        throw new Error(`failed to parse udt ${name}`);
    }
  }

  private nativeToUnion(
    val: Union<any>,
    union_: xdr.ScSpecUdtUnionV0
  ): xdr.ScVal {
    let entry_name = val.tag;
    let case_ = union_.cases().find((entry) => {
      let case_ = entry.value().name().toString();
      return case_ === entry_name;
    });
    if (!case_) {
      throw new TypeError(`no such enum entry: ${entry_name} in ${union_}`);
    }
    let key = xdr.ScVal.scvSymbol(entry_name);
    switch (case_.switch()) {
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0(): {
        return xdr.ScVal.scvVec([key]);
      }
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0(): {
        let types = (case_.value() as xdr.ScSpecUdtUnionCaseTupleV0).type();
        // if (types.length == 1) {
        //   return xdr.ScVal.scvVec([
        //     key,
        //     this.nativeToScVal(val.values, types[0]),
        //   ]);
        // }
        if (Array.isArray(val.values)) {
          if (val.values.length != types.length) {
            throw new TypeError(
              `union ${union_} expects ${types.length} values, but got ${val.values.length}`
            );
          }
          let scvals = val.values.map((v, i) =>
            this.nativeToScVal(v, types[i])
          );
          scvals.unshift(key);
          return xdr.ScVal.scvVec(scvals);
        }
        throw new Error(`failed to parse union case ${case_} with ${val}`);
      }
      default:
        throw new Error(`failed to parse union ${union_} with ${val}`);
    }

    // enum_.cases()
  }

  private nativeToStruct(val: any, struct: xdr.ScSpecUdtStructV0): xdr.ScVal {
    let fields = struct.fields();
    if (fields.some(isNumeric)) {
      if (!fields.every(isNumeric)) {
        throw new Error(
          'mixed numeric and non-numeric field names are not allowed'
        );
      }
      return xdr.ScVal.scvVec(
        fields.map((_, i) => this.nativeToScVal(val[i], fields[i].type()))
      );
    }
    return xdr.ScVal.scvMap(
      fields.map((field) => {
        let name = field.name().toString();
        return new xdr.ScMapEntry({
          key: this.nativeToScVal(name, xdr.ScSpecTypeDef.scSpecTypeSymbol()),
          val: this.nativeToScVal(val[name], field.type())
        });
      })
    );
  }

  private nativeToEnum(val: number, enum_: xdr.ScSpecUdtEnumV0): xdr.ScVal {
    if (enum_.cases().some((entry) => entry.value() === val)) {
      return xdr.ScVal.scvU32(val);
    }
    throw new TypeError(`no such enum entry: ${val} in ${enum_}`);
  }

  /**
   * Converts an base64 encoded ScVal back to a native JS value based on the given type.
   *
   * @param {string} scv the base64 encoded ScVal
   * @param {xdr.ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValStrToNative<T>(scv: string, typeDef: xdr.ScSpecTypeDef): T {
    return this.scValToNative<T>(xdr.ScVal.fromXDR(scv, 'base64'), typeDef);
  }

  /**
   * Converts an ScVal back to a native JS value based on the given type.
   *
   * @param {xdr.ScVal} scv the ScVal
   * @param {xdr.ScSpecTypeDef} typeDef the expected type
   * @returns {any} the converted native JS value
   *
   * @throws {Error} if ScVal cannot be converted to the given type
   */
  scValToNative<T>(scv: xdr.ScVal, typeDef: xdr.ScSpecTypeDef): T {
    let t = typeDef.switch();
    let value = t.value;
    if (value === xdr.ScSpecType.scSpecTypeUdt().value) {
      return this.scValUdtToNative(scv, typeDef.value() as xdr.ScSpecTypeUdt);
    }
    // we use the verbose xdr.ScValType.<type>.value form here because it's faster
    // than string comparisons and the underlying constants never need to be
    // updated
    switch (scv.switch().value) {
      case xdr.ScValType.scvVoid().value:
        return void 0 as T;

      // these can be converted to bigints directly
      case xdr.ScValType.scvU64().value:
      case xdr.ScValType.scvI64().value:
      // these can be parsed by internal abstractions note that this can also
      // handle the above two cases, but it's not as efficient (another
      // type-check, parsing, etc.)
      case xdr.ScValType.scvU128().value:
      case xdr.ScValType.scvI128().value:
      case xdr.ScValType.scvU256().value:
      case xdr.ScValType.scvI256().value:
        return scValToBigInt(scv) as T;

      case xdr.ScValType.scvVec().value: {
        if (value == xdr.ScSpecType.scSpecTypeVec().value) {
          let vec = typeDef.value() as xdr.ScSpecTypeVec;
          return (scv.vec() ?? []).map((elm) =>
            this.scValToNative(elm, vec.elementType())
          ) as T;
        } else if (value == xdr.ScSpecType.scSpecTypeTuple().value) {
          let tuple = typeDef.value() as xdr.ScSpecTypeTuple;
          let valTypes = tuple.valueTypes();
          return (scv.vec() ?? []).map((elm, i) =>
            this.scValToNative(elm, valTypes[i])
          ) as T;
        }
        throw new TypeError(`Type ${typeDef} was not vec, but ${scv} is`);
      }

      case xdr.ScValType.scvAddress().value:
        return Address.fromScVal(scv) as T;

      case xdr.ScValType.scvMap().value: {
        let map = scv.map() ?? [];
        if (value == xdr.ScSpecType.scSpecTypeMap().value) {
          let type_ = typeDef.value() as xdr.ScSpecTypeMap;
          let keyType = type_.keyType();
          let valueType = type_.valueType();
          return new Map(
            map.map((entry) => [
              this.scValToNative(entry.key(), keyType),
              this.scValToNative(entry.val(), valueType)
            ])
          ) as T;
        }
        throw new TypeError(
          `ScSpecType ${t.name} was not map, but ${JSON.stringify(
            scv,
            null,
            2
          )} is`
        );
      }

      // these return the primitive type directly
      case xdr.ScValType.scvBool().value:
      case xdr.ScValType.scvU32().value:
      case xdr.ScValType.scvI32().value:
      case xdr.ScValType.scvBytes().value:
        return scv.value() as T;

      case xdr.ScValType.scvString().value:
      case xdr.ScValType.scvSymbol().value: {
        if (
          value !== xdr.ScSpecType.scSpecTypeString().value &&
          value !== xdr.ScSpecType.scSpecTypeSymbol().value
        ) {
          throw new Error(
            `ScSpecType ${
              t.name
            } was not string or symbol, but ${JSON.stringify(scv, null, 2)} is`
          );
        }
        return scv.value()?.toString() as T;
      }

      // these can be converted to bigint
      case xdr.ScValType.scvTimepoint().value:
      case xdr.ScValType.scvDuration().value:
        return scValToBigInt(xdr.ScVal.scvU64(scv.value() as xdr.Uint64)) as T;

      // in the fallthrough case, just return the underlying value directly
      default:
        throw new TypeError(
          `failed to convert ${JSON.stringify(
            scv,
            null,
            2
          )} to native type from type ${t.name}`
        );
    }
  }

  private scValUdtToNative(scv: xdr.ScVal, udt: xdr.ScSpecTypeUdt): any {
    let entry = this.findEntry(udt.name().toString());
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        return this.enumToNative(scv, entry.value() as xdr.ScSpecUdtEnumV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.structToNative(scv, entry.value() as xdr.ScSpecUdtStructV0);
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.unionToNative(scv, entry.value() as xdr.ScSpecUdtUnionV0);
      default:
        throw new Error(
          `failed to parse udt ${udt.name().toString()}: ${entry}`
        );
    }
  }

  private unionToNative(val: xdr.ScVal, udt: xdr.ScSpecUdtUnionV0): any {
    let vec = val.vec();
    if (!vec) {
      throw new Error(`${JSON.stringify(val, null, 2)} is not a vec`);
    }
    if (vec.length === 0 && udt.cases.length !== 0) {
      throw new Error(
        `${val} has length 0, but the there are at least one case in the union`
      );
    }
    let name = vec[0].sym().toString();
    if (vec[0].switch().value != xdr.ScValType.scvSymbol().value) {
      throw new Error(`{vec[0]} is not a symbol`);
    }
    let entry = udt.cases().find(findCase(name));
    if (!entry) {
      throw new Error(
        `failed to find entry ${name} in union {udt.name().toString()}`
      );
    }
    let res: Union<any> = { tag: name, values: undefined };
    if (
      entry.switch().value ===
      xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0().value
    ) {
      let tuple = entry.value() as xdr.ScSpecUdtUnionCaseTupleV0;
      let ty = tuple.type();
      //@ts-ignore
      let values = [];
      for (let i = 0; i < ty.length; i++) {
        let v = this.scValToNative(vec[i + 1], ty[i]);
        values.push(v);
      }
      let r = { tag: name, values };
      return r;
    }
    return res;
  }
  private structToNative(val: xdr.ScVal, udt: xdr.ScSpecUdtStructV0): any {
    let res: any = {};
    let fields = udt.fields();
    if (fields.some(isNumeric)) {
      let r = val
        .vec()
        ?.map((entry, i) => this.scValToNative(entry, fields[i].type()));
      return r;
    }
    val.map()?.forEach((entry, i) => {
      let field = fields[i];
      res[field.name().toString()] = this.scValToNative(
        entry.val(),
        field.type()
      );
    });
    return res;
  }

  private enumToNative(scv: xdr.ScVal, udt: xdr.ScSpecUdtEnumV0): any {
    if (scv.switch().value !== xdr.ScValType.scvU32().value) {
      throw new Error(`Enum must have a u32 value`);
    }
    let num = scv.value() as number;
    if (udt.cases().some((entry) => entry.value() === num)) {
    }
    return num;
  }
}

function stringToScVal(str: string, ty: xdr.ScSpecType): xdr.ScVal {
  switch (ty.value) {
    case xdr.ScSpecType.scSpecTypeString().value:
      return xdr.ScVal.scvString(str);
    case xdr.ScSpecType.scSpecTypeSymbol().value:
      return xdr.ScVal.scvSymbol(str);
    case xdr.ScSpecType.scSpecTypeAddress().value: {
      let addr = Address.fromString(str as string);
      return xdr.ScVal.scvAddress(addr.toScAddress());
    }

    default:
      throw new TypeError(`invalid type ${ty.name} specified for string value`);
  }
}

function isNumeric(field: xdr.ScSpecUdtStructFieldV0) {
  return /^\d+$/.test(field.name().toString());
}

function findCase(name: string) {
  return function matches(entry: xdr.ScSpecUdtUnionCaseV0) {
    switch (entry.switch().value) {
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0().value: {
        let tuple = entry.value() as xdr.ScSpecUdtUnionCaseTupleV0;
        return tuple.name().toString() === name;
      }
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0().value: {
        let void_case = entry.value() as xdr.ScSpecUdtUnionCaseVoidV0;
        return void_case.name().toString() === name;
      }
      default:
        return false;
    }
  };
}

function readObj(args: object, input: xdr.ScSpecFunctionInputV0): any {
  let inputName = input.name().toString();
  let entry = Object.entries(args).find(([name, _]) => name === inputName);
  if (!entry) {
    throw new Error(`Missing field ${inputName}`);
  }
  return entry[1];
}
