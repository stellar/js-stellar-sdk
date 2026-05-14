import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";

export type EnumValue<Values extends Record<string, number>> =
  Values[keyof Values];

export type EnumSchema<
  Name extends string,
  Values extends Record<string, number>,
> = XdrType<EnumValue<Values>> & {
  readonly name: Name;
} & Values;

const RESERVED_ENUM_MEMBER_NAMES = new Set([
  "name",
  "kind",
  "encode",
  "decode",
  "validate",
  "_read",
  "_write",
]);

export class EnumType<Values extends Record<string, number>> extends BaseType<
  EnumValue<Values>
> {
  readonly kind = "enum";
  readonly #valuesSet = new Set<number>();

  constructor(name: string, values: Values) {
    super(name);
    for (const memberValue of Object.values(values)) {
      if (this.#valuesSet.has(memberValue)) {
        throw new XdrError(`${name}: duplicate enum value ${memberValue}`);
      }
      this.#valuesSet.add(memberValue);
    }
  }

  _read(reader: Reader, path: string): EnumValue<Values> {
    const value = reader.readInt32(path);
    if (!this.#valuesSet.has(value)) {
      throw new XdrError(`${path}: unknown enum value ${value}`);
    }
    return value as EnumValue<Values>;
  }

  _write(value: EnumValue<Values>, writer: Writer, path: string): void {
    if (typeof value !== "number" || !this.#valuesSet.has(value)) {
      throw new XdrError(`${path}: unknown enum value ${String(value)}`);
    }
    writer.writeInt32(value);
  }
}

export function enumType<
  Name extends string,
  Values extends Record<string, number>,
>(name: Name, values: Values): EnumSchema<Name, Values> {
  for (const memberName of Object.keys(values)) {
    if (RESERVED_ENUM_MEMBER_NAMES.has(memberName)) {
      throw new XdrError(
        `${name}: enum member name ${memberName} collides with reserved property`,
      );
    }
  }
  const schema = new EnumType(name, values);
  return Object.assign(schema, values) as unknown as EnumSchema<Name, Values>;
}
