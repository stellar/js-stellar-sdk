import { XdrError } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
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
  // The enum's xdrgen `member_prefix`, camelized to match the member names
  // (`SCV_` → `scv`). Stripped off each member before snake_casing to recover
  // the canonical SEP-0051 JSON name (`scvBool` − `scv` → `bool`). Absent for
  // enums without a prefix. See {@link PrefixedEnumSchema}.
  readonly memberPrefix?: string;
}

/**
 * An enum schema tagged with its (camelized) xdrgen `member_prefix`. The Rust
 * `stellar-xdr` crate strips this prefix from every variant before serde
 * renders it `snake_case`, so we record it and strip it the same way when
 * emitting SEP-0051 JSON (`scvBool` − `scv` → `bool`).
 *
 * The prefix is the one piece of information `camelize` destroys (the `SCV_`
 * boundary in `SCV_BOOL` → `scvBool`), so it can't be recovered at runtime and
 * must be carried on the schema. SEP-0051 is a Stellar concept, so this field
 * lives on the value-layer enum schema rather than the generic `enumType`
 * builder in `types/enum.ts`, which stays agnostic. Enums with no prefix omit
 * it entirely and just `snake_case` their member names.
 */
export interface PrefixedEnumSchema {
  readonly memberPrefix: string;
}

/**
 * Tag an enum schema with its camelized `member_prefix` so the JSON walker can
 * strip it when deriving SEP-0051 names (see {@link PrefixedEnumSchema}).
 */
export function withMemberPrefix<T extends XdrType<unknown>>(
  schema: T,
  memberPrefix: string,
): T & PrefixedEnumSchema {
  return Object.assign(schema, { memberPrefix });
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
