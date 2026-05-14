import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type Infer, type XdrType } from "../core/xdr-type.js";
import { isPlainObject } from "../core/helpers.js";

class StructType<
  Shape extends Record<string, XdrType<unknown>>,
> extends BaseType<{
  readonly [K in keyof Shape]: Infer<Shape[K]>;
}> {
  readonly kind = "struct";
  readonly #entries: [keyof Shape, Shape[keyof Shape]][];

  constructor(name: string, fields: Shape) {
    super(name);
    this.#entries = Object.entries(fields) as [
      keyof Shape,
      Shape[keyof Shape],
    ][];
  }

  _read(
    reader: Reader,
    path: string,
  ): { readonly [K in keyof Shape]: Infer<Shape[K]> } {
    reader.enter(path);
    try {
      const value: Partial<{ readonly [K in keyof Shape]: Infer<Shape[K]> }> =
        {};
      for (const [key, schema] of this.#entries) {
        value[key] = schema._read(reader, `${path}.${String(key)}`) as Infer<
          Shape[typeof key]
        >;
      }
      return value as { readonly [K in keyof Shape]: Infer<Shape[K]> };
    } finally {
      reader.exit();
    }
  }

  _write(
    value: { readonly [K in keyof Shape]: Infer<Shape[K]> },
    writer: Writer,
    path: string,
  ): void {
    if (!isPlainObject(value)) {
      throw new XdrError(`${path}: expected plain object`);
    }
    for (const [key, schema] of this.#entries) {
      if (!(key in value)) {
        throw new XdrError(`${path}.${String(key)}: missing struct field`);
      }
      schema._write(
        value[key] as Infer<Shape[typeof key]>,
        writer,
        `${path}.${String(key)}`,
      );
    }
  }
}

export function struct<
  Name extends string,
  Shape extends Record<string, XdrType<unknown>>,
>(
  name: Name,
  fields: Shape,
): XdrType<{ readonly [K in keyof Shape]: Infer<Shape[K]> }> & {
  readonly name: Name;
} {
  return new StructType(name, fields) as unknown as XdrType<{
    readonly [K in keyof Shape]: Infer<Shape[K]>;
  }> & {
    readonly name: Name;
  };
}
