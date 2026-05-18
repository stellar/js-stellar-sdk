import { XdrError } from "../core/error.js";
import { XdrValue } from "./xdr-value.js";

/**
 * Shared base for XDR enums.
 *
 * Subclasses use a private constructor and expose static singleton instances
 * for each enum member. The schema for an enum is the underlying int32 plus a
 * name↔value mapping kept on the subclass via `static readonly nameByValue` and
 * `static readonly valueByName`.
 *
 * `toJson()` is inherited from `XdrValue`, which walks the schema and applies
 * SEP-0051 naming (stripped + snake_cased), so members render the same way
 * whether they're at the top level or nested inside another type.
 */
export abstract class EnumValue<Name extends string> extends XdrValue {
  readonly name: Name;
  readonly value: number;

  protected constructor(name: Name, value: number) {
    super();
    this.name = name;
    this.value = value;
  }

  toXdrObject(): number {
    return this.value;
  }
}

export function enumLookup<Name extends string>(
  className: string,
  map: Readonly<Record<number, EnumValue<Name>>>,
  value: number,
): EnumValue<Name> {
  const instance = map[value];
  if (instance === undefined) {
    throw new XdrError(`${className}: unknown enum value ${value}`);
  }
  return instance;
}
