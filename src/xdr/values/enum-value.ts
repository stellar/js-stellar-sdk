import { XdrError } from "../core/error.js";
import { XdrValue } from "./xdr-value.js";

/**
 * Shared base for XDR enums.
 *
 * Subclasses use a private constructor and expose static singleton instances
 * for each enum member. The schema for an enum is the underlying int32 plus a
 * value→name mapping exposed via `static readonly schema.nameByValue`.
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

export interface EnumSchemaView<Name extends string> {
  readonly nameByValue: ReadonlyMap<number, Name>;
}

type EnumInstances<
  Name extends string,
  Instance extends EnumValue<Name>,
> = Readonly<Record<Name, Instance>>;

export function enumFromValue<
  Name extends string,
  Instance extends EnumValue<Name>,
>(
  className: string,
  schema: EnumSchemaView<Name>,
  instances: EnumInstances<Name, Instance>,
  value: number,
): Instance {
  const name = schema.nameByValue.get(value);
  if (name === undefined) {
    throw new XdrError(`${className}: unknown enum value ${value}`);
  }
  return enumFromName(className, instances, name);
}

export function enumFromName<
  Name extends string,
  Instance extends EnumValue<Name>,
>(
  className: string,
  instances: EnumInstances<Name, Instance>,
  name: Name,
): Instance {
  const instance = instances[name];
  if (!(instance instanceof EnumValue)) {
    throw new XdrError(`${className}: unknown name ${name}`);
  }
  return instance;
}
